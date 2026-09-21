import { of } from 'rxjs';

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { NotifyLogService } from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';

import { ViewRolesDialogComponent, ViewRolesDialogData } from './view-roles-dialog.component';

describe('ViewRolesDialogComponent', () => {
    let fixture: ComponentFixture<ViewRolesDialogComponent>;

    const close = vi.fn();
    const repository = {
        GetRelatedGraph: vi.fn(({ type }: { type: DomainObjectType }) =>
            of({
                nodes: new Set([
                    ...(type === DomainObjectType.wallet_config
                        ? [{ ref: { wallet_config: { id: 'wallet-1' } }, name: 'Wallet 1' }]
                        : [
                              {
                                  ref: { shop_config: { id: 'shop-1' } },
                                  name: 'Test shop 1',
                              },
                          ]),
                ]),
            }),
        ),
    };

    const dialogData: ViewRolesDialogData = {
        email: 'invitee@example.com',
        partyId: 'party-1',
        roles: [
            {
                role_id: 'Manager',
                scope: { scope_id: 'Shop', resource_id: 'shop-1' },
            },
            {
                role_id: 'Administrator',
            },
        ],
    };

    beforeEach(async () => {
        vi.resetAllMocks();
        TestBed.configureTestingModule({
            imports: [ViewRolesDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: MAT_DIALOG_DATA, useValue: dialogData },
                { provide: MatDialogRef, useValue: { close } },
                { provide: NotifyLogService, useValue: { error: vi.fn() } },
                { provide: ThriftRepositoryService, useValue: repository },
            ],
        });
        fixture = TestBed.createComponent(ViewRolesDialogComponent);
        await fixture.whenStable();
    });

    it('renders dialog header, description, and automatically expands first assigned role', async () => {
        const root = fixture.nativeElement as HTMLElement;
        expect(root.textContent).toContain('Roles');
        expect(root.textContent).toContain('invitee@example.com');

        const managerPanel = root.querySelector('[data-role="Manager"]')!;
        expect(
            managerPanel.querySelector('mat-expansion-panel-header')!.getAttribute('aria-expanded'),
        ).toBe('true');
        expect(managerPanel.textContent).toContain('Test shop 1');
    });

    it('does not render any assignment form or remove buttons in readonly mode', async () => {
        const root = fixture.nativeElement as HTMLElement;
        expect(root.querySelectorAll('[data-assignment-form]')).toHaveLength(0);
        expect(root.querySelectorAll('button[aria-label^="Remove"]')).toHaveLength(0);
    });

    it('closes dialog on Close button click', async () => {
        const root = fixture.nativeElement as HTMLElement;
        const closeButton = root.querySelector<HTMLButtonElement>('v-dialog-actions button')!;
        closeButton.click();
        await fixture.whenStable();

        expect(close).toHaveBeenCalled();
    });
});
