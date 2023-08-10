import { Injectable } from '@angular/core';
import { Shop } from '@vality/domain-proto/domain';
import { PartyID, ShopID } from '@vality/domain-proto/payment_processing';
import { BehaviorSubject, Observable, defer, EMPTY, merge } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { inProgressFrom, progressTo } from '@cc/utils';

@Injectable()
export class FetchShopService {
    shop$: Observable<Shop> = defer(() => this.getShop$).pipe(
        switchMap(({ partyID, shopID }) =>
            this.partyManagementService.GetShop(partyID, shopID).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.notificationErrorService.error(
                        err,
                        'An error occurred while fetching shop',
                    );
                    return EMPTY;
                }),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    contract$ = defer(() => this.getShop$).pipe(
        switchMap(({ partyID, shopID }) =>
            this.partyManagementService.GetShopContract(partyID, shopID).pipe(
                progressTo(this.progress$),
                catchError((err) => {
                    this.notificationErrorService.error(
                        err,
                        'An error occurred while fetching shop contract',
                    );
                    return EMPTY;
                }),
            ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    inProgress$ = inProgressFrom(() => this.progress$, merge(this.shop$, this.contract$));

    private getShop$ = new BehaviorSubject<{ partyID: PartyID; shopID: ShopID }>(null);
    private progress$ = new BehaviorSubject(0);

    constructor(
        private partyManagementService: PartyManagementService,
        private notificationErrorService: NotificationErrorService,
    ) {}

    getShop(partyID: PartyID, shopID: ShopID) {
        this.getShop$.next({ shopID, partyID });
    }

    reload() {
        if (this.getShop$.value) this.getShop$.next(this.getShop$.value);
    }
}
