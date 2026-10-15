import { Subject, of, throwError } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NotifyLogService } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

import { ModifyOrganizationDialogComponent } from './modify-organization-dialog.component';

describe('ModifyOrganizationDialogComponent allowed IPs', () => {
    let fixture: ComponentFixture<ModifyOrganizationDialogComponent>;
    let organization: domain.Organization;
    const modifyOrganization = vi.fn(() => of(undefined));
    const log = { success: vi.fn(), error: vi.fn() };
    const close = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        modifyOrganization.mockReturnValue(of(undefined));
        organization = {
            id: 'org-1',
            party_id: 'party-1',
            owner_id: 'owner-1',
            name: 'Organization',
            status: domain.OrganizationStatus.active,
            created_at: '2026-10-13T00:00:00Z',
            allowed_ips: new Set(['192.0.2.1', '2001:db8::1']),
        };
        TestBed.configureTestingModule({
            imports: [ModifyOrganizationDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: MAT_DIALOG_DATA, useValue: organization },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: log },
                {
                    provide: ThriftOrganizationManagementService,
                    useValue: { modifyOrganization },
                },
            ],
        });
    });

    async function render() {
        fixture = TestBed.createComponent(ModifyOrganizationDialogComponent);
        await fixture.whenStable();
    }

    function root(): HTMLElement {
        return fixture.nativeElement as HTMLElement;
    }

    function ipInputs(): HTMLInputElement[] {
        return Array.from(root().querySelectorAll('cc-allowed-ips-field input'));
    }

    async function fill(input: HTMLInputElement, value: string) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
    }

    async function save() {
        root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.click();
        await fixture.whenStable();
    }

    it('shows existing IPv4 and IPv6 addresses without changing the organization', async () => {
        await render();

        expect(ipInputs().map((input) => input.value)).toEqual(['192.0.2.1', '2001:db8::1', '']);
        expect(modifyOrganization).not.toHaveBeenCalled();
    });

    it('saves edited and added addresses as a trimmed set without duplicates or empty rows', async () => {
        await render();
        await fill(ipInputs()[0], ' 192.0.2.2 ');
        expect(fixture.componentInstance.controlModel().allowed_ips.includes(' 192.0.2.2 ')).toBe(
            true,
        );
        await fill(ipInputs()[2], '192.0.2.2');
        await save();

        expect(modifyOrganization).toHaveBeenCalledExactlyOnceWith('org-1', {
            name: 'Organization',
            allowed_ips: new Set(['192.0.2.2', '2001:db8::1']),
        });
        expect(organization.allowed_ips).toEqual(new Set(['192.0.2.1', '2001:db8::1']));
        expect(close).toHaveBeenCalledWith({ status: 'success', data: undefined });
    });

    it('sends an explicit empty set when all addresses are removed', async () => {
        await render();
        for (let i = 0; i < 2; i++) {
            root()
                .querySelector<HTMLButtonElement>(
                    'cc-allowed-ips-field button[aria-label^="Remove IP address"]',
                )!
                .click();
            await fixture.whenStable();
        }
        await save();

        expect(modifyOrganization).toHaveBeenCalledExactlyOnceWith('org-1', {
            name: 'Organization',
            allowed_ips: new Set(),
        });
    });

    it('omits untouched IPs when only the name changes', async () => {
        await render();
        await fill(root().querySelector<HTMLInputElement>('v-input-field input')!, 'Renamed');
        await save();

        expect(modifyOrganization).toHaveBeenCalledExactlyOnceWith('org-1', { name: 'Renamed' });
    });

    it('keeps absent IP restrictions absent when saving the organization', async () => {
        delete organization.allowed_ips;
        await render();
        expect(ipInputs()).toHaveLength(1);
        await save();

        expect(modifyOrganization).toHaveBeenCalledExactlyOnceWith('org-1', {
            name: 'Organization',
        });
    });

    it('allows clearing metadata without sending creation-only fields', async () => {
        organization.metadata = '{"source":"test"}';
        await render();
        const metadata = root().querySelectorAll<HTMLInputElement>('v-input-field input')[1];
        await fill(metadata, '');
        await save();

        expect(modifyOrganization).toHaveBeenCalledExactlyOnceWith('org-1', {
            name: 'Organization',
            metadata: '',
        });
        expect(root().querySelector('cc-user-field')).toBeNull();
        expect(root().querySelector('cc-merchant-field')).toBeNull();
    });

    it('retains edited addresses and keeps the dialog open after an API error', async () => {
        const error = new Error('Invalid IP address');
        modifyOrganization.mockReturnValueOnce(throwError(() => error));
        await render();
        await fill(ipInputs()[0], 'invalid-address');
        await save();

        expect(log.error).toHaveBeenCalledWith(error);
        expect(close).not.toHaveBeenCalled();
        expect(ipInputs()[0].value).toBe('invalid-address');
        expect(fixture.componentInstance.progress()).toBe(0);
    });

    it('disables editing and prevents duplicate saves while the request is pending', async () => {
        const pending = new Subject<undefined>();
        modifyOrganization.mockReturnValueOnce(pending);
        await render();
        await fill(ipInputs()[0], '192.0.2.2');
        await save();

        expect(ipInputs().every((input) => input.matches(':disabled'))).toBe(true);
        expect(root().querySelector<HTMLButtonElement>('v-dialog-actions button')!.disabled).toBe(
            true,
        );
        fixture.componentInstance.modify();
        expect(modifyOrganization).toHaveBeenCalledOnce();
        pending.complete();
        await fixture.whenStable();
        expect(ipInputs().every((input) => !input.matches(':disabled'))).toBe(true);
    });
});
