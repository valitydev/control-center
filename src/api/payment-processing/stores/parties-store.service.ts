import { MemoizeExpiring } from 'typescript-memoize';

import { Injectable, inject } from '@angular/core';

import {
    PartyConfigRef,
    ShopConfigObject,
    ShopID,
    WalletConfigObject,
    WalletID,
} from '@vality/domain-proto/domain';
import { VersionedObjectInfo } from '@vality/domain-proto/domain_config_v2';
import { getNoTimeZoneIsoString } from '@vality/matez';

import { DomainObjectsStoreService, DomainService } from '../../domain-config';

export interface ShopWithInfo extends ShopConfigObject {
    info: VersionedObjectInfo;
}

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
    getParty(partyId: PartyConfigRef['id']) {
        return this.domainObjectsStoreService
            .getObject({ party_config: { id: partyId } })
            .map((obj) => obj.object.party_config);
    }

    @MemoizeExpiring(5_000)
    getPartyShops(partyId: PartyConfigRef['id']) {
        return this.domainObjectsStoreService
            .getObjects('shop_config')
            .map<
                ShopWithInfo[]
            >((shops) => shops.filter((s) => s.object.shop_config.data.party_ref.id === partyId).map((s) => ({ info: s.info, ...s.object.shop_config })));
    }

    @MemoizeExpiring(5_000)
    getPartyWallets(partyId: PartyConfigRef['id']) {
        return this.wallets.map((wallets) =>
            wallets.filter((w) => w.data.party_ref.id === partyId),
        );
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
        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: {
                            ref: shop.ref,
                            data: {
                                ...shop.data,
                                block: {
                                    blocked: {
                                        reason,
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    unblockShop(shop: ShopConfigObject, reason: string) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: {
                            ref: shop.ref,
                            data: {
                                ...shop.data,
                                block: {
                                    unblocked: {
                                        reason,
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    suspendShop(shop: ShopConfigObject) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: {
                            ref: shop.ref,
                            data: {
                                ...shop.data,
                                suspension: {
                                    suspended: { since: getNoTimeZoneIsoString(new Date()) },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    activateShop(shop: ShopConfigObject) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        shop_config: {
                            ref: shop.ref,
                            data: {
                                ...shop.data,
                                suspension: {
                                    active: { since: getNoTimeZoneIsoString(new Date()) },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    blockWallet(wallet: WalletConfigObject, reason: string) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        wallet_config: {
                            ref: wallet.ref,
                            data: {
                                ...wallet.data,
                                block: {
                                    blocked: {
                                        reason,
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    unblockWallet(wallet: WalletConfigObject, reason: string) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        wallet_config: {
                            ref: wallet.ref,
                            data: {
                                ...wallet.data,
                                block: {
                                    unblocked: {
                                        reason,
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    suspendWallet(wallet: WalletConfigObject) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        wallet_config: {
                            ref: wallet.ref,
                            data: {
                                ...wallet.data,
                                suspension: {
                                    suspended: {
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }

    activateWallet(wallet: WalletConfigObject) {
        return this.domainService.commit([
            {
                update: {
                    object: {
                        wallet_config: {
                            ref: wallet.ref,
                            data: {
                                ...wallet.data,
                                suspension: {
                                    active: {
                                        since: getNoTimeZoneIsoString(new Date()),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);
    }
}
