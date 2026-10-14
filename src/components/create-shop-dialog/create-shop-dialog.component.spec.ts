import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogResponseStatus, DialogService, NotifyLogService } from '@vality/matez';

import { DomainService } from '~/api/domain-config';
import { ConfigService } from '~/services';

import { CreateShopDialogComponent } from './create-shop-dialog.component';

describe('CreateShopDialogComponent advanced editing', () => {
    const open = vi.fn();
    const close = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            imports: [CreateShopDialogComponent],
            providers: [
                provideZonelessChangeDetection(),
                { provide: MAT_DIALOG_DATA, useValue: { partyId: 'party-1' } },
                { provide: MatDialogRef, useValue: { close } },
                { provide: DomainService, useValue: {} },
                { provide: DialogService, useValue: { open } },
                { provide: NotifyLogService, useValue: {} },
                {
                    provide: ConfigService,
                    useValue: {
                        config: {
                            value: signal({
                                default: {
                                    prod: { paymentInstitution: 1, category: 2, termset: 3 },
                                },
                            }),
                        },
                    },
                },
            ],
        });
        // Isolate the handoff from unrelated controls in the basic form.
        TestBed.overrideComponent(CreateShopDialogComponent, {
            set: { template: '', imports: [] },
        });
    });

    it('opens advanced editing before an account has been selected', async () => {
        const fixture = TestBed.createComponent(CreateShopDialogComponent);
        await fixture.whenStable();

        fixture.componentInstance.editFull();

        expect(open).toHaveBeenCalledOnce();
        expect(open.mock.calls[0][1].initValue).toMatchObject({
            party_ref: { id: 'party-1' },
            terms: { id: 3 },
        });
        expect(open.mock.calls[0][1].initValue.account).toBeUndefined();
        expect(close).toHaveBeenCalledWith({
            status: DialogResponseStatus.Cancelled,
            data: undefined,
        });
    });

    it('preserves the selected account when opening advanced editing', async () => {
        const fixture = TestBed.createComponent(CreateShopDialogComponent);
        await fixture.whenStable();
        fixture.componentInstance.shopModel.update((value) => ({
            ...value,
            name: 'shop',
            account: { currency: 'USD', accounts: [100, 101] },
        }));

        fixture.componentInstance.editFull();

        expect(open).toHaveBeenCalledOnce();
        expect(open.mock.calls[0][1].initValue.account).toEqual({
            currency: { symbolic_code: 'USD' },
            settlement: 100,
            guarantee: 101,
        });
    });
});
