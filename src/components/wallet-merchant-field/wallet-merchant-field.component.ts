import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form } from '@angular/forms/signals';

import { PartyConfigRef, WalletID } from '@vality/domain-proto/domain';

import { DomainService } from '~/api/domain-config';

import { MerchantFieldModule } from '../merchant-field';
import { WalletFieldModule } from '../wallet-field';

export interface PartyWallet {
    party_id: PartyConfigRef['id'];
    wallet_id: WalletID;
}

@Component({
    selector: 'cc-wallet-merchant-field',
    templateUrl: './wallet-merchant-field.component.html',
    imports: [CommonModule, ReactiveFormsModule, WalletFieldModule, MerchantFieldModule, FormField],
})
export class WalletMerchantFieldComponent implements FormValueControl<PartyWallet>, OnInit {
    private dr = inject(DestroyRef);
    private domainService = inject(DomainService);
    private injector = inject(Injector);

    value = model<PartyWallet>({
        party_id: null,
        wallet_id: null,
    });
    control = form(this.value);

    ngOnInit() {
        toObservable(this.value, { injector: this.injector })
            .pipe(
                map((v) => v.wallet_id),
                filter(Boolean),
                distinctUntilChanged(),
                switchMap((walletId) =>
                    this.domainService.get({ wallet_config: { id: walletId } }),
                ),
                map((wallet) => wallet.object.wallet_config.data.party_ref.id),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((party_id) => {
                if (party_id !== this.value().party_id) {
                    this.value.update((v) => ({ ...v, party_id }));
                }
            });
    }
}
