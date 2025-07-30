import { Injectable, inject } from '@angular/core';
import { PartyID, ShopID, WalletID } from '@vality/domain-proto/domain';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { DomainObjectsStoreService } from '../../domain-config';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);

    parties$ = this.domainObjectsStoreService.getObjects('party_config').value$.pipe(
        map((objs) => objs.map((obj) => obj.object.party_config)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    shops$ = this.domainObjectsStoreService.getObjects('shop_config').value$.pipe(
        map((objs) => objs.map((obj) => obj.object.shop_config)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    wallets$ = this.domainObjectsStoreService.getObjects('wallet_config').value$.pipe(
        map((objs) => objs.map((obj) => obj.object.wallet_config)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    @MemoizeExpiring(5_000)
    getParty(partyId: PartyID) {
        return this.domainObjectsStoreService
            .getObject({ party_config: { id: partyId } })
            .value$.pipe(
                map((obj) => obj.object.party_config.data),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }

    @MemoizeExpiring(5_000)
    getPartyShops(partyId: PartyID) {
        return this.getParty(partyId).pipe(
            switchMap((party) =>
                this.shops$.pipe(
                    map((shops) =>
                        shops.filter((s) => party.shops.some((ps) => ps.id === s.ref.id)),
                    ),
                ),
            ),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5_000)
    getPartyWallets(partyId: PartyID) {
        return this.getParty(partyId).pipe(
            switchMap((party) =>
                this.wallets$.pipe(
                    map((wallets) =>
                        wallets.filter((w) => party.wallets.some((pw) => pw.id === w.ref.id)),
                    ),
                ),
            ),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5_000)
    getShop(shopId: ShopID) {
        return this.domainObjectsStoreService
            .getObject({ shop_config: { id: shopId } })
            .value$.pipe(
                map((obj) => obj.object.shop_config.data),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }

    @MemoizeExpiring(5_000)
    getWallet(walletId: WalletID) {
        return this.domainObjectsStoreService
            .getObject({ wallet_config: { id: walletId } })
            .value$.pipe(
                map((obj) => obj.object.wallet_config.data),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }
}
