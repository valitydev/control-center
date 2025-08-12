import isNil from 'lodash-es/isNil';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import {
    MerchantStatisticsService,
    PaymentSearchQuery,
    StatPayment,
} from '@vality/magista-proto/magista';
import { FetchOptions, FetchResult, FetchSuperclass, NotifyLogService, clean } from '@vality/matez';

function splitInvoicePaymentId(invoicePaymentId: string) {
    const [invoiceId, paymentId] = invoicePaymentId.split('.');
    return { invoiceId, paymentId };
}

@Injectable({
    providedIn: 'root',
})
export class FetchPaymentsService extends FetchSuperclass<StatPayment, PaymentSearchQuery> {
    private merchantStatisticsService = inject(MerchantStatisticsService);
    private log = inject(NotifyLogService);

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
