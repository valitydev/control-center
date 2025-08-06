import { Injectable, inject } from '@angular/core';
import { PartyID, ShopConfigObject, ShopID, WalletID } from '@vality/domain-proto/domain';
import { cloneDeep } from 'lodash-es';
import { MemoizeExpiring } from 'typescript-memoize';

import { DomainObjectsStoreService, DomainService } from '../../domain-config';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private domainService = inject(DomainService);

    parties = this.domainObjectsStoreService
        .getObjects('party_config')
        .map((objs) => objs.map((obj) => obj.object.party_config));
    shops = this.domainObjectsStoreService
        .getObjects('shop_config')
        .map((objs) => objs.map((obj) => obj.object.shop_config));
    wallets = this.domainObjectsStoreService
        .getObjects('wallet_config')
        .map((objs) => objs.map((obj) => obj.object.wallet_config));

    @MemoizeExpiring(5_000)
    getParty(partyId: PartyID) {
        return this.domainObjectsStoreService
            .getObject({ party_config: { id: partyId } })
            .map((obj) => obj.object.party_config);
    }

    @MemoizeExpiring(5_000)
    getPartyShops(partyId: PartyID) {
        return this.shops.map((shops) => shops.filter((s) => s.data.party_id === partyId));
    }

    @MemoizeExpiring(5_000)
    getPartyWallets(partyId: PartyID) {
        return this.wallets.map((wallets) => wallets.filter((w) => w.data.party_id === partyId));
    }

    @MemoizeExpiring(5_000)
    getShop(shopId: ShopID) {
        return this.domainObjectsStoreService
            .getObject({ shop_config: { id: shopId } })
            .map((obj) => obj.object.shop_config);
    }

    @MemoizeExpiring(5_000)
    getWallet(walletId: WalletID) {
        return this.domainObjectsStoreService
            .getObject({ wallet_config: { id: walletId } })
            .map((obj) => obj.object.wallet_config);
    }

    reloadParties() {
        this.parties.reload();
    }

    reloadShops() {
        this.shops.reload();
    }

    reloadWallets() {
        this.wallets.reload();
    }

    blockShop(shop: ShopConfigObject, reason: string) {
        const newShopConfig = cloneDeep(shop);
        newShopConfig.data.block = { blocked: { reason, since: new Date().toISOString() } };

        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: newShopConfig,
                    },
                },
            },
        ]);
    }

    unblockShop(shop: ShopConfigObject, reason: string) {
        const newShopConfig = cloneDeep(shop);
        newShopConfig.data.block = { unblocked: { reason, since: new Date().toISOString() } };

        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: newShopConfig,
                    },
                },
            },
        ]);
    }

    suspendShop(shop: ShopConfigObject) {
        const newShopConfig = cloneDeep(shop);
        newShopConfig.data.suspension = { suspended: { since: new Date().toISOString() } };

        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: newShopConfig,
                    },
                },
            },
        ]);
    }

    activateShop(shop: ShopConfigObject) {
        const newShopConfig = cloneDeep(shop);
        newShopConfig.data.suspension = { active: { since: new Date().toISOString() } };

        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: newShopConfig,
                    },
                },
            },
        ]);
    }
}
