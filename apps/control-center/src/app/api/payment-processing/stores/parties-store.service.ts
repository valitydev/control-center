import { Injectable, inject } from '@angular/core';
import { PartyID, ShopID, WalletID } from '@vality/domain-proto/domain';
import { PartyManagement } from '@vality/domain-proto/payment_processing';
import { progressTo } from '@vality/matez';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { FistfulStatisticsService, createDsl } from '../../fistful-stat';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    private partyManagementService = inject(PartyManagement);
    private fistfulStatisticsService = inject(FistfulStatisticsService);
    progress$ = new BehaviorSubject(0);

    @MemoizeExpiring(5 * 60_000)
    get(partyId: PartyID) {
        return this.partyManagementService
            .Get(partyId)
            .pipe(progressTo(this.progress$), shareReplay({ refCount: true, bufferSize: 1 }));
    }

    @MemoizeExpiring(5 * 60_000)
    getShop(shopId: ShopID, partyId: PartyID) {
        return this.get(partyId).pipe(
            map((p) => p.shops.get(shopId)),
            progressTo(this.progress$),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getWallet(walletId: WalletID, partyId: PartyID) {
        // return this.get(partyId).pipe(
        //     map((p) => p.wallets.get(walletId)),
        //     progressTo(this.progress$),
        //     shareReplay({ refCount: true, bufferSize: 1 }),
        // );
        // TODO: We get it from fistful because wallets are not returned in the party object
        return this.getWallets(partyId).pipe(
            map((wallets) => wallets.find((w) => w.id === walletId)),
            progressTo(this.progress$),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getContractor(shopId: ShopID, partyId: PartyID) {
        return combineLatest([this.get(partyId), this.getShop(shopId, partyId)]).pipe(
            map(([party, shop]) => {
                const contractorId = party.contracts.get(shop.contract_id)?.contractor_id;
                return party.contractors.get(contractorId)?.contractor;
            }),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    getContract(shopId: ShopID, partyId: PartyID) {
        return combineLatest([this.get(partyId), this.getShop(shopId, partyId)]).pipe(
            map(([party, shop]) => party.contracts.get(shop.contract_id)),
        );
    }

    @MemoizeExpiring(5 * 60_000)
    private getWallets(partyId: PartyID) {
        return this.fistfulStatisticsService
            .GetWallets({ dsl: createDsl({ wallets: { party_id: partyId } }) })
            .pipe(
                map(({ data }) => data.wallets),
                progressTo(this.progress$),
                shareReplay({ refCount: true, bufferSize: 1 }),
            );
    }
}
