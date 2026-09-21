import { of, throwError } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { NotifyLogService } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, sortRoleIds } from '~/api/org-management';
import { ThriftOrganizationManagementService, ThriftRepositoryService } from '~/api/services';

import { CreateInvitationDialogComponent } from './create-invitation-dialog.component';

describe('CreateInvitationDialogComponent', () => {
    let fixture: ComponentFixture<CreateInvitationDialogComponent>;
    let activeRole: string;

    const createInvitation = vi.fn(
        (_organizationId: string, _request: { email: string; roles: domain.RoleAssignment[] }) =>
            of({} as domain.Invitation),
    );

    const repository = {
        GetRelatedGraph: vi.fn(({ type }: { type: DomainObjectType }) =>
            of({
                nodes: new Set([
                    ...(type === DomainObjectType.wallet_config
                        ? [{ ref: { wallet_config: { id: 'wallet-1' } }, name: 'Wallet 1' }]
                        : ['shop-1', 'shop-2'].map((id) => ({
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
            imports: [CreateInvitationDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { organizationId: 'org-1', partyId: 'party-1' },
                },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: log },
                {
                    provide: ThriftOrganizationManagementService,
                    useValue: { CreateInvitation: createInvitation },
                },
                { provide: ThriftRepositoryService, useValue: repository },
            ],
        });
        fixture = TestBed.createComponent(CreateInvitationDialogComponent);
        await fixture.whenStable();
    });

    function root(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    function panel(): HTMLElement {
        return root().querySelector(`[data-role="${activeRole}"]`)!;
    }

    async function openRole(roleId: string) {
        activeRole = roleId;
        const header = panel().querySelector<HTMLElement>('mat-expansion-panel-header')!;
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
            )!
            .click();
        await fixture.whenStable();
        const option = Array.from(document.querySelectorAll<HTMLElement>('.ng-select-option')).find(
            (item) => item.textContent?.trim() === label,
        );
        expect(option).toBeDefined();
        option!.click();
        await fixture.whenStable();
        await vi.waitFor(() =>
            expect(document.querySelectorAll('.ng-select-option')).toHaveLength(0),
        );
    }

    async function assign() {
        panel().querySelector<HTMLButtonElement>('button[mat-flat-button]')!.click();
        await fixture.whenStable();
    }

    function fillEmail(email: string) {
        const input = root().querySelector<HTMLInputElement>('v-input-field input')!;
        input.value = email;
        input.dispatchEvent(new Event('input'));
    }

    it('renders email input and role manager with all roles in priority order', async () => {
        expect(root().querySelector('v-input-field')).not.toBeNull();
        expect(root().querySelector('cc-member-roles-manager')).not.toBeNull();

        const panels = Array.from(root().querySelectorAll('mat-expansion-panel')) as HTMLElement[];
        expect(panels.map((item) => item.getAttribute('data-role'))).toEqual(
            sortRoleIds(Object.keys(ROLES)),
        );

        const sendButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        )!;
        expect(sendButton.disabled).toBe(true);
    });

    it('sends an invitation without roles', async () => {
        fillEmail('invitee@example.com');
        await fixture.whenStable();

        const sendButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        )!;
        expect(sendButton.disabled).toBe(false);
        sendButton.click();
        await fixture.whenStable();

        expect(createInvitation).toHaveBeenCalledExactlyOnceWith('org-1', {
            email: 'invitee@example.com',
            roles: [],
        });
        expect(log.success).toHaveBeenCalledWith('Invitation sent');
        expect(close).toHaveBeenCalled();
    });

    it('assigns roles locally and submits them with the invitation without undefined scope', async () => {
        fillEmail('invitee@example.com');
        await fixture.whenStable();

        await openRole('Administrator');
        await assign();

        await openRole('Manager');
        await selectOption('resource', 'Test shop-1');
        await assign();

        expect(createInvitation).not.toHaveBeenCalled();
        expect(fixture.componentInstance.roles()).toHaveLength(2);

        const sendButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        )!;
        sendButton.click();
        await fixture.whenStable();

        expect(createInvitation).toHaveBeenCalledExactlyOnceWith('org-1', {
            email: 'invitee@example.com',
            roles: [
                { role_id: 'Administrator' },
                {
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
            ],
        });
        expect(Object.hasOwn(createInvitation.mock.calls[0][1].roles[0], 'scope')).toBe(false);
        expect(log.success).toHaveBeenCalledWith('Invitation sent');
        expect(close).toHaveBeenCalled();
    });

    it('removes assigned roles locally before submitting', async () => {
        fillEmail('invitee@example.com');
        await fixture.whenStable();

        await openRole('Manager');
        await selectOption('resource', 'Test shop-1');
        await assign();
        expect(fixture.componentInstance.roles()).toHaveLength(1);

        panel().querySelector<HTMLElement>('button[aria-label^="Remove"]')!.click();
        await fixture.whenStable();

        expect(fixture.componentInstance.roles()).toHaveLength(0);
        expect(panel().querySelector('mat-panel-description')!.textContent?.trim()).toBe(
            'no roles',
        );

        const sendButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        )!;
        sendButton.click();
        await fixture.whenStable();

        expect(createInvitation).toHaveBeenCalledExactlyOnceWith('org-1', {
            email: 'invitee@example.com',
            roles: [],
        });
    });

    it('prevents duplicate role assignments', async () => {
        await openRole('Administrator');
        await assign();
        expect(fixture.componentInstance.roles()).toHaveLength(1);

        fixture.componentInstance.assignRole({ role_id: 'Administrator' });
        expect(fixture.componentInstance.roles()).toHaveLength(1);
    });

    it('handles error when CreateInvitation fails', async () => {
        const error = new Error('Invitation failed');
        createInvitation.mockReturnValueOnce(throwError(() => error));

        fillEmail('invitee@example.com');
        await fixture.whenStable();

        const sendButton = root().querySelector<HTMLButtonElement>(
            'v-dialog-actions button[mat-flat-button]',
        )!;
        sendButton.click();
        await fixture.whenStable();

        expect(log.error).toHaveBeenCalledWith(error);
        expect(close).not.toHaveBeenCalled();
    });
});
