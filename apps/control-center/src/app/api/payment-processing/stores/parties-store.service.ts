import { Injectable, inject } from '@angular/core';
import { PartyID, ShopID, WalletID } from '@vality/domain-proto/domain';
import { progressTo } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { DomainObjectsStoreService } from '../../domain-config';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    progress$ = new BehaviorSubject(0);

    @MemoizeExpiring(5 * 60_000)
    get(partyId: PartyID) {
        return this.domainObjectsStoreService.getObject({ party_config: { id: partyId } }).pipe(
            map((obj) => obj.object.party_config.data),
            progressTo(this.progress$),
            // TODO
            shareReplay(1),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getShop(shopId: ShopID) {
        return this.domainObjectsStoreService.getObject({ shop_config: { id: shopId } }).pipe(
            map((obj) => obj.object.shop_config.data),
            progressTo(this.progress$),
            // TODO
            shareReplay(1),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getWallet(walletId: WalletID) {
        return this.domainObjectsStoreService.getObject({ wallet_config: { id: walletId } }).pipe(
            map((obj) => obj.object.wallet_config.data),
            progressTo(this.progress$),
            // TODO
            shareReplay(1),
        );
    }
}
