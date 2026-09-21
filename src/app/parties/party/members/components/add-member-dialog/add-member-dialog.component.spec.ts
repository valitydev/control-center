import { of, throwError } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { DialogResponseStatus, NotifyLogService } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, sortRoleIds } from '~/api/org-management';
import { ThriftOrganizationManagementService, ThriftRepositoryService } from '~/api/services';

import { AddMemberDialogComponent } from './add-member-dialog.component';

describe('AddMemberDialogComponent', () => {
    let fixture: ComponentFixture<AddMemberDialogComponent>;
    let activeRole: string;

    const service = {
        ListUsers: vi.fn(() => of({ users: [] })),
        AddMember: vi.fn((_org: string, member: { user_id: string; email?: string }) =>
            of({ user: { id: member.user_id, email: member.email }, roles: [] }),
        ),
        AssignMemberRole: vi.fn((_org: string, _user: string, role: domain.RoleAssignment) =>
            of({ id: 'assigned-role-id', ...role }),
        ),
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
            imports: [AddMemberDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { organizationId: 'org-1', partyId: 'party-1' },
                },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: log },
                { provide: ThriftOrganizationManagementService, useValue: service },
                { provide: ThriftRepositoryService, useValue: repository },
            ],
        });
        fixture = TestBed.createComponent(AddMemberDialogComponent);
        await fixture.whenStable();
    });

    function root(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    function panel(): HTMLElement {
        return root().querySelector(`[data-role="${activeRole}"]`);
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

    function fillUser(userId: string, email: string) {
        fixture.componentInstance.controlModel.set({ user_id: userId, email });
    }

    it('renders user, email inputs and role manager with all roles in priority order', async () => {
        expect(root().querySelector('cc-user-field')).toBeDefined();
        expect(root().querySelector('v-input-field')).toBeDefined();

        const panels = Array.from(root().querySelectorAll('mat-expansion-panel')) as HTMLElement[];
        expect(panels.map((item) => item.getAttribute('data-role'))).toEqual(
            sortRoleIds(Object.keys(ROLES)),
        );

        const addButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        );
        expect(addButton.disabled).toBe(true);
    });

    it('assigns and removes roles locally without API calls until submit', async () => {
        await openRole('Manager');
        expect(panel().textContent).toContain('No assignments');

        await selectOption('resource', 'Test shop-1');
        await assign();

        expect(service.AssignMemberRole).not.toHaveBeenCalled();
        expect(fixture.componentInstance.roles()).toHaveLength(1);
        expect(fixture.componentInstance.roles()[0]).toMatchObject({
            role_id: 'Manager',
            scope: { scope_id: 'Shop', resource_id: 'shop-1' },
        });
        expect(panel().textContent).toContain('Test shop-1');

        panel().querySelector<HTMLElement>('button[aria-label^="Remove"]').click();
        await fixture.whenStable();

        expect(fixture.componentInstance.roles()).toHaveLength(0);
        expect(panel().textContent).toContain('No assignments');
        expect(service.AssignMemberRole).not.toHaveBeenCalled();
    });

    it('adds a member without roles', async () => {
        fillUser('user-123', 'user@example.com');
        await fixture.whenStable();

        const addButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        );
        expect(addButton.disabled).toBe(false);
        addButton.click();
        await fixture.whenStable();

        expect(service.AddMember).toHaveBeenCalledExactlyOnceWith('org-1', {
            user_id: 'user-123',
            email: 'user@example.com',
        });
        expect(service.AssignMemberRole).not.toHaveBeenCalled();
        expect(log.success).toHaveBeenCalledWith('Member added');
        expect(close).toHaveBeenCalledWith({ status: DialogResponseStatus.Success });
    });

    it('adds a member with multiple assigned roles', async () => {
        fillUser('user-456', 'manager@example.com');
        await fixture.whenStable();

        await openRole('Administrator');
        await assign();

        await openRole('Manager');
        await selectOption('resource', 'Test shop-2');
        await assign();

        const addButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        );
        addButton.click();
        await fixture.whenStable();

        expect(service.AddMember).toHaveBeenCalledExactlyOnceWith('org-1', {
            user_id: 'user-456',
            email: 'manager@example.com',
        });
        expect(service.AssignMemberRole).toHaveBeenCalledTimes(2);
        expect(service.AssignMemberRole).toHaveBeenNthCalledWith(1, 'org-1', 'user-456', {
            role_id: 'Administrator',
        });
        expect(service.AssignMemberRole).toHaveBeenNthCalledWith(2, 'org-1', 'user-456', {
            role_id: 'Manager',
            scope: { scope_id: 'Shop', resource_id: 'shop-2' },
        });
        expect(close).toHaveBeenCalledWith({ status: DialogResponseStatus.Success });
    });

    it('prevents duplicate assignments locally and filters assigned shops and hides selectors on entire org', async () => {
        await openRole('Manager');
        await selectOption('resource', 'Test shop-1');
        await assign();

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
        expect(options).toContain('Test shop-2');
        document.body.click();
        await fixture.whenStable();

        await openRole('Administrator');
        await assign();
        expect(panel().querySelectorAll('v-select-field')).toHaveLength(0);
        expect(panel().textContent).toContain(
            'This role is already assigned to the entire organization.',
        );
    });

    it('handles error when AddMember fails', async () => {
        const error = new Error('AddMember failed');
        service.AddMember.mockReturnValueOnce(throwError(() => error));

        fillUser('user-fail', 'fail@example.com');
        await fixture.whenStable();

        const addButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        );
        addButton.click();
        await fixture.whenStable();

        expect(log.error).toHaveBeenCalledWith(error);
        expect(close).not.toHaveBeenCalled();
    });
});
