import { of } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NotifyLogService } from '@vality/matez';

import { ThriftOrganizationManagementService } from '~/api/services';

import { CreateOrganizationDialogComponent } from './create-organization-dialog.component';

describe('CreateOrganizationDialogComponent', () => {
    let fixture: ComponentFixture<CreateOrganizationDialogComponent>;
    const createOrganization = vi.fn(() => of({}));
    const close = vi.fn();

    beforeEach(async () => {
        vi.resetAllMocks();
        createOrganization.mockReturnValue(of({}));
        TestBed.configureTestingModule({
            imports: [CreateOrganizationDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: MAT_DIALOG_DATA, useValue: { partyId: 'party-1' } },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: { success: vi.fn(), error: vi.fn() } },
                {
                    provide: ThriftOrganizationManagementService,
                    useValue: { createOrganization, listUsers: vi.fn(() => of({ users: [] })) },
                },
            ],
        });
        fixture = TestBed.createComponent(CreateOrganizationDialogComponent);
        fixture.componentInstance.controlModel.update((model) => ({
            ...model,
            name: 'Organization',
            owner_id: 'owner-1',
        }));
        await fixture.whenStable();
    });

    function root(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    it('creates an organization with normalized IP restrictions entered in the shared form', async () => {
        const input = root().querySelector<HTMLInputElement>('cc-allowed-ips-field input')!;
        input.focus();
        input.value = ' 2001:db8::1 ';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        const inputs = root().querySelectorAll<HTMLInputElement>('cc-allowed-ips-field input');
        expect(inputs).toHaveLength(2);
        expect(inputs[1].value).toBe('');
        expect(document.activeElement).toBe(input);
        root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.click();
        await fixture.whenStable();

        expect(createOrganization).toHaveBeenCalledExactlyOnceWith({
            name: 'Organization',
            party_id: 'party-1',
            owner_id: 'owner-1',
            allowed_ips: new Set(['2001:db8::1']),
        });
        expect(close).toHaveBeenCalled();
    });

    it('omits optional IP restrictions when no addresses are configured', async () => {
        root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.click();
        await fixture.whenStable();

        expect(createOrganization).toHaveBeenCalledExactlyOnceWith({
            name: 'Organization',
            party_id: 'party-1',
            owner_id: 'owner-1',
        });
    });

    it('keeps the supplied party hidden and uses the explicit owner control', () => {
        expect(fixture.componentInstance.controlModel().party_id).toBe('party-1');
        expect(root().querySelector('cc-merchant-field')).toBeNull();
        expect(root().querySelector<HTMLInputElement>('cc-user-field input')!.value).toBe(
            'owner-1',
        );
        expect(root().querySelector('v-thrift-editor')).toBeNull();
    });

    it.each(['name', 'party_id', 'owner_id'] as const)(
        'prevents creation without %s',
        async (field) => {
            fixture.componentInstance.controlModel.update((request) => ({
                ...request,
                [field]: '',
            }));
            await fixture.whenStable();

            expect(
                root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.disabled,
            ).toBe(true);
            fixture.componentInstance.create();
            expect(createOrganization).not.toHaveBeenCalled();
        },
    );

    it('submits metadata from the same request model', async () => {
        fixture.componentInstance.controlModel.update((request) => ({
            ...request,
            metadata: '{"source":"test"}',
        }));
        await fixture.whenStable();
        root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.click();
        await fixture.whenStable();

        expect(createOrganization).toHaveBeenCalledExactlyOnceWith({
            name: 'Organization',
            party_id: 'party-1',
            owner_id: 'owner-1',
            metadata: '{"source":"test"}',
        });
    });
});
