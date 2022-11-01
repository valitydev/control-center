import { Injectable } from '@angular/core';
import { PartyID, ShopID, Shop } from '@vality/domain-proto';
import { BehaviorSubject, Observable, defer, EMPTY, merge } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { ErrorService } from '@cc/app/shared/services/error';
import { inProgressFrom, progressTo } from '@cc/utils';

@Injectable()
export class FetchShopService {
    shop$: Observable<Shop> = defer(() => this.getShop$).pipe(
        switchMap(({ partyID, shopID }) =>
            this.partyManagementService.GetShop(partyID, shopID).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.errorService.error(err, 'An error occurred while fetching shop');
                    return EMPTY;
                })
            )
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    contract$ = defer(() => this.getShop$).pipe(
        switchMap(({ partyID, shopID }) =>
            this.partyManagementService.GetShopContract(partyID, shopID).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.errorService.error(err, 'An error occurred while fetching shop contract');
                    return EMPTY;
                })
            )
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    inProgress$ = inProgressFrom(() => this.progress$, merge(this.shop$, this.contract$));

    private getShop$ = new BehaviorSubject<{ partyID: PartyID; shopID: ShopID }>(null);
    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementService: PartyManagementService,
        private errorService: ErrorService
    ) {}

    getShop(partyID: PartyID, shopID: ShopID) {
        this.getShop$.next({ shopID, partyID });
    }

    reload() {
        if (this.getShop$.value) this.getShop$.next(this.getShop$.value);
    }
}
