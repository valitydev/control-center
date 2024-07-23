import { Injectable } from '@angular/core';
import { StatPayment, PaymentSearchQuery } from '@vality/magista-proto/magista';
import {
    FetchSuperclass,
    FetchOptions,
    FetchResult,
    NotifyLogService,
    clean,
} from '@vality/ng-core';
import isNil from 'lodash-es/isNil';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';

function splitInvoicePaymentId(invoicePaymentId: string) {
    const [invoiceId, paymentId] = invoicePaymentId.split('.');
    return { invoiceId, paymentId };
}

@Injectable({
    providedIn: 'root',
})
export class FetchPaymentsService extends FetchSuperclass<StatPayment, PaymentSearchQuery> {
    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(
        params: PaymentSearchQuery,
        { size, continuationToken }: FetchOptions,
    ): Observable<FetchResult<StatPayment>> {
        const invoicePaymentIds = (params.invoice_ids || []).map((id) => splitInvoicePaymentId(id));
        const invoiceIds = [...new Set(invoicePaymentIds.map(({ invoiceId }) => invoiceId))];
        return this.merchantStatisticsService
            .SearchPayments({
                payment_params: {},
                ...params,
                ...clean({ invoice_ids: invoiceIds }),
                common_search_query_params: Object.assign({}, params.common_search_query_params, {
                    continuation_token: continuationToken,
                    limit: size,
                }),
            })
            .pipe(
                map(({ payments, continuation_token }) => ({
                    result: params.invoice_ids?.length
                        ? payments.filter((p) =>
                              invoicePaymentIds.some(
                                  (id) =>
                                      id.invoiceId === p.invoice_id &&
                                      (isNil(id.paymentId) || id.paymentId === p.id),
                              ),
                          )
                        : payments,
                    continuationToken: continuation_token,
                })),
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'payments');
                    return of({ result: [] });
                }),
            );
    }
}
