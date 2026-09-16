import { of } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NotifyLogService } from '@vality/matez';

import { ThriftOrganizationManagementService, ThriftRepositoryService } from '~/api/services';

import { CreateInvitationDialogComponent } from './create-invitation-dialog.component';

describe('CreateInvitationDialogComponent', () => {
    it('submits an organization-wide role without an undefined scope', async () => {
        const createInvitation = vi.fn(
            (_organizationId: string, _request: { email: string; roles: { role_id: string }[] }) =>
                of({}),
        );
        const close = vi.fn();
        TestBed.configureTestingModule({
            imports: [CreateInvitationDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { organizationId: 'org-1', partyId: 'party-1' },
                },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: { success: vi.fn(), error: vi.fn() } },
                {
                    provide: ThriftOrganizationManagementService,
                    useValue: { CreateInvitation: createInvitation },
                },
                {
                    provide: ThriftRepositoryService,
                    useValue: { GetRelatedGraph: () => of({ nodes: new Set() }) },
                },
            ],
        });
        const fixture = TestBed.createComponent(CreateInvitationDialogComponent);
        await fixture.whenStable();
        const element: HTMLElement = fixture.nativeElement;
        const create = element.querySelector<HTMLButtonElement>('v-dialog-actions button');
        expect(create.disabled).toBe(true);

        const email = element.querySelector('input');
        email.value = 'member@example.com';
        email.dispatchEvent(new Event('input'));
        element.querySelector<HTMLButtonElement>('cc-role-assignments-field button').click();
        await fixture.whenStable();
        expect(create.disabled).toBe(false);
        create.click();
        await fixture.whenStable();

        expect(createInvitation).toHaveBeenCalledWith('org-1', {
            email: 'member@example.com',
            roles: [expect.objectContaining({ role_id: 'Integrator' })],
        });
        expect(Object.hasOwn(createInvitation.mock.calls[0][1].roles[0], 'scope')).toBe(false);
        expect(close).toHaveBeenCalled();
    });
});
