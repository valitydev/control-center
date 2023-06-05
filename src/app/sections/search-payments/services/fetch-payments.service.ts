import { Injectable } from '@angular/core';
import { StatPayment, PaymentSearchQuery } from '@vality/magista-proto/magista';
import { FetchSuperclass, FetchOptions, FetchResult, NotifyLogService } from '@vality/ng-core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';

@Injectable({
    providedIn: 'root',
})
export class FetchPaymentsService extends FetchSuperclass<StatPayment, PaymentSearchQuery> {
    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private log: NotifyLogService
    ) {
        super();
    }

    protected fetch(
        params: PaymentSearchQuery,
        { size, continuationToken }: FetchOptions
    ): Observable<FetchResult<StatPayment>> {
        return this.merchantStatisticsService
            .SearchPayments({
                payment_params: {},
                ...params,
                common_search_query_params: Object.assign({}, params.common_search_query_params, {
                    continuation_token: continuationToken,
                    limit: size,
                }),
            })
            .pipe(
                map(({ payments, continuation_token }) => ({
                    result: payments,
                    continuationToken: continuation_token,
                })),
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'payments');
                    return of({ result: [] });
                })
            );
    }
}
