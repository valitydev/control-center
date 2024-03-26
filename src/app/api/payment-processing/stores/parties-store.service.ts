import { Injectable } from '@angular/core';
import { PartyID } from '@vality/domain-proto/domain';
import { ShopID, WalletID } from '@vality/domain-proto/internal/domain';
import { progressTo } from '@vality/ng-core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    progress$ = new BehaviorSubject(0);

    constructor(private partyManagementService: PartyManagementService) {}

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
        return this.get(partyId).pipe(
            map((p) => p.wallets.get(walletId)),
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
}
