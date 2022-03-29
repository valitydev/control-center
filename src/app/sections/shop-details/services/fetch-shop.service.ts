import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PartyID, ShopID } from '@vality/domain-proto';
import { BehaviorSubject, merge, of, Subject } from 'rxjs';
import { catchError, filter, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PartyManagementWithUserService } from '@cc/app/api/payment-processing';
import { progress } from '@cc/app/shared/custom-operators';

@Injectable()
export class FetchShopService {
    private getShop$ = new BehaviorSubject<{ partyID: PartyID; shopID: ShopID }>(null);
    private hasError$: Subject<any> = new Subject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    shop$ = this.getShop$.pipe(
        switchMap(({ partyID, shopID }) =>
            this.partyManagementWithUserService.getShop(partyID, shopID).pipe(
                catchError((e) => {
                    this.hasError$.next(e);
                    this.snackBar.open('An error occurred while fetching shop', 'OK');
                    return of('error');
                })
            )
        ),
        filter((result) => result !== 'error'),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.getShop$, merge(this.shop$, this.hasError$)).pipe(startWith(true));

    constructor(
        private partyManagementWithUserService: PartyManagementWithUserService,
        private snackBar: MatSnackBar
    ) {}

    getShop(partyID: PartyID, shopID: ShopID) {
        this.getShop$.next({ shopID, partyID });
    }
}
