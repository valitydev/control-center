import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { cleanPrimitiveProps, NotifyLogService, progressTo, inProgressFrom } from '@vality/matez';
import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';

@Injectable()
export class PaymentDetailsService {
    payment$ = this.route.params.pipe(
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
                    }),
                )
                .pipe(
                    map(({ payments }) => payments[0]),
                    tap((payment) => {
                        if (!payment) {
                            this.log.error('Payment not found');
                        }
                    }),
                    progressTo(this.progress$),
                ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = inProgressFrom(() => this.progress$, this.payment$);

    private progress$ = new BehaviorSubject(0);

    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private route: ActivatedRoute,
        private log: NotifyLogService,
    ) {}
}
