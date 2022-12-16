import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { cleanPrimitiveProps } from '@vality/ng-core';
import { combineLatest, of } from 'rxjs';
import { map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';
import { PartyManagementService } from '@cc/app/api/payment-processing';
import { progress } from '@cc/app/shared/custom-operators';

@Injectable()
export class PaymentDetailsService {
    private partyID$ = this.route.params.pipe(pluck('partyID'), shareReplay(1));

    private routeParams$ = this.route.params.pipe(shareReplay(1));

    // eslint-disable-next-line @typescript-eslint/member-ordering
    payment$ = this.routeParams$.pipe(
        switchMap(({ partyID, invoiceID, paymentID }) =>
            this.merchantStatisticsService
                .SearchPayments(
                    cleanPrimitiveProps({
                        common_search_query_params: {
                            from_time: new Date('2020-01-01').toISOString(), // TODO
                            to_time: new Date().toISOString(),
                            party_id: partyID,
                        },
                        payment_params: {
                            payment_id: paymentID,
                        },
                        invoice_ids: [invoiceID],
                    })
                )
                .pipe(
                    map(({ payments }) => payments[0]),
                    tap((payment) => {
                        if (!payment) {
                            this.snackBar.open('An error occurred when receiving payment', 'OK');
                        }
                    })
                )
        ),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.routeParams$, this.payment$).pipe(shareReplay(1));

    // eslint-disable-next-line @typescript-eslint/member-ordering
    shop$ = this.payment$.pipe(
        switchMap((payment) => combineLatest([this.partyID$, of(payment.shop_id)])),
        switchMap(([partyID, shopID]) => this.partyManagementService.GetShop(partyID, shopID)),
        shareReplay(1)
    );

    constructor(
        private partyManagementService: PartyManagementService,
        private merchantStatisticsService: MerchantStatisticsService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {}
}
