import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, inject, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, FormValueControl, form } from '@angular/forms/signals';

import { PartyConfigRef, ShopID } from '@vality/domain-proto/domain';

import { DomainService } from '~/api/domain-config';

import { MerchantFieldModule } from '../merchant-field';
import { ShopFieldModule } from '../shop-field';

export interface PartyShop {
    party_id: PartyConfigRef['id'];
    shop_id: ShopID;
}

@Component({
    selector: 'cc-shop-merchant-field',
    templateUrl: './shop-merchant-field.component.html',
    imports: [CommonModule, ReactiveFormsModule, ShopFieldModule, MerchantFieldModule, FormField],
})
export class ShopMerchantFieldComponent implements FormValueControl<PartyShop>, OnInit {
    private dr = inject(DestroyRef);
    private domainService = inject(DomainService);
    private injector = inject(Injector);

    value = model<PartyShop>({
        party_id: null,
        shop_id: null,
    });
    control = form(this.value);

    ngOnInit() {
        toObservable(this.value, { injector: this.injector })
            .pipe(
                map((v) => v.shop_id),
                filter(Boolean),
                distinctUntilChanged(),
                switchMap((shopId) => this.domainService.get({ shop_config: { id: shopId } })),
                map((shop) => shop.object.shop_config.data.party_ref.id),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((party_id) => {
                if (party_id !== this.value().party_id) {
                    this.value.update((v) => ({ ...v, party_id }));
                }
            });
    }
}
