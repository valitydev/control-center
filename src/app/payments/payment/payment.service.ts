import { BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MerchantStatisticsService } from '@vality/magista-proto/magista';
import { NotifyLogService, cleanPrimitiveProps, inProgressFrom, progressTo } from '@vality/matez';

@Injectable()
export class PaymentDetailsService {
    private merchantStatisticsService = inject(MerchantStatisticsService);
    private route = inject(ActivatedRoute);
    private log = inject(NotifyLogService);
    payment$ = this.route.params.pipe(
        map(({ paymentID }) => {
            const [invoiceId, paymentId] = (paymentID || '').split('.');
            return { invoiceId, paymentId };
        }),
        switchMap(({ paymentId, invoiceId }) =>
            this.merchantStatisticsService
                .SearchPayments(
                    cleanPrimitiveProps({
                        common_search_query_params: {
                            from_time: new Date('2020-01-01').toISOString(), // TODO
                            to_time: new Date().toISOString(),
                        },
                        payment_params: {
                            payment_id: paymentId,
                        },
                        invoice_ids: [invoiceId],
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
}
