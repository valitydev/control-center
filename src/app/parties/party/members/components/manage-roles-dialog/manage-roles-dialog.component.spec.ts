import { Subject, of, throwError } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { DialogResponseStatus, NotifyLogService } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, sortRoleIds } from '~/api/org-management';
import { ThriftOrganizationManagementService, ThriftRepositoryService } from '~/api/services';

import { ManageRolesDialogComponent } from './manage-roles-dialog.component';

function shopRole(id: string): domain.MemberRole {
    return { id: `role-${id}`, role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: id } };
}

describe('ManageRolesDialogComponent', () => {
    let fixture: ComponentFixture<ManageRolesDialogComponent>;
    let activeRole: string;
    const member: domain.Member = {
        user: { id: 'user-1' },
        roles: [shopRole('shop-1'), shopRole('shop-2')],
    };
    const service = {
        GetMember: vi.fn(() => of(member)),
        AssignMemberRole: vi.fn((_org: string, _user: string, role: domain.RoleAssignment) =>
            of({ id: 'assigned-role-id', ...role }),
        ),
        RemoveMemberRole: vi.fn(() => of(undefined)),
    };
    const repository = {
        GetRelatedGraph: vi.fn(({ type }: { type: DomainObjectType }) =>
            of({
                nodes: new Set([
                    ...(type === DomainObjectType.wallet_config
                        ? [{ ref: { wallet_config: { id: 'wallet-1' } }, name: 'Wallet 1' }]
                        : ['shop-1', 'shop-2', 'shop-3', 'shop-4'].map((id) => ({
                              ref: { shop_config: { id } },
                              name: `Test ${id}`,
                          }))),
                ]),
            }),
        ),
    };
    const log = { success: vi.fn(), error: vi.fn() };
    const close = vi.fn();

    beforeEach(async () => {
        vi.resetAllMocks();
        activeRole = 'Administrator';
        TestBed.configureTestingModule({
            imports: [ManageRolesDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { organizationId: 'org-1', partyId: 'party-1', member },
                },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: log },
                { provide: ThriftOrganizationManagementService, useValue: service },
                { provide: ThriftRepositoryService, useValue: repository },
            ],
        });
        fixture = TestBed.createComponent(ManageRolesDialogComponent);
        await fixture.whenStable();
    });

    function panel(): HTMLElement {
        return fixture.nativeElement.querySelector(`[data-role="${activeRole}"]`);
    }

    async function openRole(roleId: string) {
        activeRole = roleId;
        const header = panel().querySelector<HTMLElement>('mat-expansion-panel-header');
        if (header.getAttribute('aria-expanded') !== 'true') {
            header.click();
            await fixture.whenStable();
        }
    }

    async function selectOption(field: 'scope' | 'resource', label: string) {
        const index = field === 'scope' ? 1 : 2;
        panel()
            .querySelector<HTMLElement>(
                `[data-assignment-form] v-select-field:nth-of-type(${index}) .ng-select-control`,
            )
            .click();
        await fixture.whenStable();
        const option = Array.from(document.querySelectorAll<HTMLElement>('.ng-select-option')).find(
            (item) => item.textContent.trim() === label,
        );
        expect(option).toBeDefined();
        option.click();
        await fixture.whenStable();
        await vi.waitFor(() =>
            expect(document.querySelectorAll('.ng-select-option')).toHaveLength(0),
        );
    }

    async function assign() {
        panel().querySelector<HTMLButtonElement>('button[mat-flat-button]').click();
        await fixture.whenStable();
    }

    it('shows every known role in priority order, including roles without assignments', async () => {
        const panels = Array.from(
            fixture.nativeElement.querySelectorAll('mat-expansion-panel'),
        ) as HTMLElement[];
        expect(panels.map((item) => item.getAttribute('data-role'))).toEqual(
            sortRoleIds(Object.keys(ROLES)),
        );
        await openRole('Accountant');
        expect(panel().textContent).toContain('No assignments');
        expect(panel().querySelectorAll('[data-assignment-form]')).toHaveLength(1);
        expect(panel().querySelector('mat-panel-description').textContent.trim()).toBe('no roles');
        expect(
            fixture.nativeElement
                .querySelector('[data-role="Manager"] mat-panel-description')
                .textContent.trim(),
        ).toBe('2 shops');
        expect(
            fixture.nativeElement.querySelectorAll('v-dialog > [data-assignment-form]'),
        ).toHaveLength(0);
        expect(service.AssignMemberRole).not.toHaveBeenCalled();
    });

    it('orders organization, shops and wallets with separators and displays both resource names and IDs', async () => {
        service.GetMember.mockReturnValueOnce(
            of({
                ...member,
                roles: [
                    {
                        id: 'wallet-role',
                        role_id: 'Manager',
                        scope: { scope_id: 'Wallet', resource_id: 'wallet-1' },
                    },
                    ...member.roles,
                    { id: 'organization-role', role_id: 'Manager' },
                ],
            }),
        );
        fixture.componentInstance.member.reload();
        await fixture.whenStable();
        await openRole('Manager');
        const sections = Array.from(panel().querySelectorAll('section'));
        expect(sections.map((section) => section.getAttribute('data-scope'))).toEqual([
            '',
            'Shop',
            'Wallet',
        ]);
        expect(sections[0].nextElementSibling.tagName).toBe('MAT-DIVIDER');
        expect(sections[1].nextElementSibling.tagName).toBe('MAT-DIVIDER');
        expect(sections[0].textContent).toContain('Entire organization');
        expect(sections[1].textContent).toContain('Test shop-1');
        expect(sections[1].querySelector('[data-role-id="role-shop-1"]').textContent).toContain(
            'shop-1',
        );
        expect(sections[2].textContent).toContain('Wallet 1');
        expect(sections[2].textContent).toContain('wallet-1');
        panel().querySelector<HTMLElement>('[data-role-id="organization-role"] button').click();
        await fixture.whenStable();
        expect(service.RemoveMemberRole).toHaveBeenCalledExactlyOnceWith(
            'org-1',
            'user-1',
            'organization-role',
        );
        expect(fixture.componentInstance.roles()).toHaveLength(3);
    });

    it('keeps each role form independent and shares the resource catalogs between panels', async () => {
        await openRole('Manager');
        await selectOption('resource', 'Test shop-3');
        await openRole('Accountant');
        expect(panel().querySelectorAll('.ng-select-has-value')).toHaveLength(1);
        await selectOption('scope', 'Wallet');
        await selectOption('resource', 'Wallet 1');
        await openRole('Manager');
        expect(panel().querySelector('[data-assignment-form]').textContent).toContain(
            'Test shop-3',
        );
        await assign();
        expect(service.AssignMemberRole).toHaveBeenLastCalledWith('org-1', 'user-1', {
            role_id: 'Manager',
            scope: { scope_id: 'Shop', resource_id: 'shop-3' },
        });
        await openRole('Accountant');
        expect(panel().querySelector('[data-assignment-form]').textContent).toContain('Wallet 1');
        await assign();
        expect(service.AssignMemberRole).toHaveBeenLastCalledWith('org-1', 'user-1', {
            role_id: 'Accountant',
            scope: { scope_id: 'Wallet', resource_id: 'wallet-1' },
        });
        expect(service.AssignMemberRole).toHaveBeenCalledTimes(2);
        expect(repository.GetRelatedGraph).toHaveBeenCalledTimes(2);
    });

    it('allows only one shop and does not mutate roles until Assign is clicked', async () => {
        await openRole('Manager');
        await selectOption('resource', 'Test shop-4');
        await selectOption('resource', 'Test shop-3');
        expect(
            panel().querySelectorAll('v-select-field:nth-of-type(2) .ng-select-value'),
        ).toHaveLength(1);
        expect(service.AssignMemberRole).not.toHaveBeenCalled();
        await assign();
        expect(service.AssignMemberRole).toHaveBeenCalledExactlyOnceWith('org-1', 'user-1', {
            role_id: 'Manager',
            scope: { scope_id: 'Shop', resource_id: 'shop-3' },
        });
        expect(
            panel().querySelectorAll('v-select-field:nth-of-type(2) .ng-select-value'),
        ).toHaveLength(0);
    });

    it('removes only the selected assignment and keeps the role panel after removing its last assignment', async () => {
        await openRole('Manager');
        for (const role of member.roles) {
            panel().querySelector<HTMLElement>(`[data-role-id="${role.id}"] button`).click();
            await fixture.whenStable();
        }
        expect(service.RemoveMemberRole).toHaveBeenCalledTimes(2);
        expect(service.RemoveMemberRole).toHaveBeenNthCalledWith(
            1,
            'org-1',
            'user-1',
            'role-shop-1',
        );
        expect(service.RemoveMemberRole).toHaveBeenNthCalledWith(
            2,
            'org-1',
            'user-1',
            'role-shop-2',
        );
        expect(panel().textContent).toContain('No assignments');
        expect(panel().querySelector('[data-assignment-form]')).not.toBeNull();
        fixture.componentInstance.closeDialog();
        expect(close).toHaveBeenCalledWith({
            status: DialogResponseStatus.Success,
            data: undefined,
        });
    });

    it('clears the resource on scope change and assigns only the selected wallet', async () => {
        await openRole('Manager');
        await selectOption('resource', 'Test shop-3');
        await selectOption('scope', 'Wallet');
        expect(panel().querySelectorAll('.ng-select-has-value')).toHaveLength(1);
        await selectOption('resource', 'Wallet 1');
        expect(service.AssignMemberRole).not.toHaveBeenCalled();
        await assign();
        expect(service.AssignMemberRole).toHaveBeenCalledExactlyOnceWith('org-1', 'user-1', {
            role_id: 'Manager',
            scope: { scope_id: 'Wallet', resource_id: 'wallet-1' },
        });
        expect(service.RemoveMemberRole).not.toHaveBeenCalled();
    });

    it('omits scope for organization-wide access and uses the returned ID for removal', async () => {
        await openRole('Administrator');
        await assign();
        expect(service.AssignMemberRole).toHaveBeenCalledExactlyOnceWith('org-1', 'user-1', {
            role_id: 'Administrator',
        });
        panel().querySelector<HTMLElement>('[data-role-id="assigned-role-id"] button').click();
        await fixture.whenStable();
        expect(service.RemoveMemberRole).toHaveBeenCalledExactlyOnceWith(
            'org-1',
            'user-1',
            'assigned-role-id',
        );
    });

    it('prevents duplicate assignments in the panel and API handler and hides selectors when entire org is assigned', async () => {
        await openRole('Manager');
        panel()
            .querySelector<HTMLElement>(
                '[data-assignment-form] v-select-field:nth-of-type(2) .ng-select-control',
            )
            .click();
        await fixture.whenStable();
        const options = Array.from(document.querySelectorAll<HTMLElement>('.ng-select-option')).map(
            (item) => item.textContent.trim(),
        );
        expect(options).not.toContain('Test shop-1');
        expect(options).not.toContain('Test shop-2');
        expect(options).toContain('Test shop-3');
        expect(options).toContain('Test shop-4');
        document.body.click();
        await fixture.whenStable();

        fixture.componentInstance.assignRole({
            role_id: 'Manager',
            scope: { scope_id: 'Shop', resource_id: 'shop-1' },
        });
        expect(service.AssignMemberRole).not.toHaveBeenCalled();

        await openRole('Administrator');
        await assign();
        expect(panel().querySelectorAll('v-select-field')).toHaveLength(0);
        expect(panel().textContent).toContain(
            'This role is already assigned to the entire organization.',
        );
    });

    it('keeps the form selection and current assignments when adding fails', async () => {
        const error = new Error('Assignment failed');
        service.AssignMemberRole.mockReturnValueOnce(throwError(() => error));
        await openRole('Manager');
        await selectOption('resource', 'Test shop-3');
        await assign();
        expect(fixture.componentInstance.roles()).toEqual(member.roles);
        expect(panel().querySelector('[data-assignment-form]').textContent).toContain(
            'Test shop-3',
        );
        expect(log.error).toHaveBeenCalledWith(error);
        expect(service.RemoveMemberRole).not.toHaveBeenCalled();
    });

    it('keeps an assignment when deletion fails', async () => {
        const error = new Error('Removal failed');
        service.RemoveMemberRole.mockReturnValueOnce(throwError(() => error));
        fixture.componentInstance.removeRole(member.roles[0]);
        await fixture.whenStable();
        expect(service.RemoveMemberRole).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.roles()).toEqual(member.roles);
        expect(log.error).toHaveBeenCalledWith(error);
    });

    it('blocks further mutations and closing while one request is pending', async () => {
        const pending = new Subject<domain.MemberRole>();
        service.AssignMemberRole.mockReturnValue(pending);
        await openRole('Administrator');
        await assign();
        fixture.componentInstance.assignRole({ role_id: 'Accountant' });
        fixture.componentInstance.removeRole(member.roles[0]);
        fixture.componentInstance.closeDialog();
        expect(service.AssignMemberRole).toHaveBeenCalledTimes(1);
        expect(service.RemoveMemberRole).not.toHaveBeenCalled();
        expect(fixture.componentInstance.roles()).toEqual(member.roles);
        expect(close).not.toHaveBeenCalled();
        expect(fixture.nativeElement.querySelector('.dialog-title-close')).toBeNull();
        pending.next({ id: 'assigned-role-id', role_id: 'Administrator' });
        pending.complete();
        await fixture.whenStable();
        expect(fixture.componentInstance.roles()).toHaveLength(3);
        expect(fixture.nativeElement.querySelector('v-dialog-actions button').disabled).toBe(false);
    });

    it('preserves confirmed changes when reloading fails and displays IDs for missing catalog entries', async () => {
        await openRole('Administrator');
        await assign();
        service.GetMember.mockReturnValueOnce(throwError(() => new Error('Refresh failed')));
        fixture.componentInstance.member.reload();
        await fixture.whenStable();
        expect(fixture.componentInstance.roles()).toContainEqual({
            id: 'assigned-role-id',
            role_id: 'Administrator',
        });
        service.GetMember.mockReturnValueOnce(of({ ...member, roles: [shopRole('unknown-shop')] }));
        fixture.componentInstance.member.reload();
        await fixture.whenStable();
        await openRole('Manager');
        expect(panel().querySelector('[data-role-id="role-unknown-shop"]').textContent).toContain(
            'unknown-shop',
        );
    });
});
