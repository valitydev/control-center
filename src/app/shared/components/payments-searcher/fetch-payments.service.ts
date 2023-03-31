import { Injectable } from '@angular/core';
import { StatPayment } from '@vality/magista-proto/magista';
import { cleanPrimitiveProps, clean, splitIds } from '@vality/ng-core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

import { SearchFiltersParams } from '../payments-search-filters';

const SEARCH_LIMIT = 50;

@Injectable()
export class FetchPaymentsService extends PartialFetcher<StatPayment, SearchFiltersParams> {
    constructor(private merchantStatisticsService: MerchantStatisticsService) {
        super();
    }

    protected fetch(
        params: SearchFiltersParams,
        continuationToken: string
    ): Observable<FetchResult<StatPayment>> {
        const {
            partyID,
            fromTime,
            toTime,
            invoiceIDs,
            shopIDs,
            payerEmail,
            terminalID,
            providerID,
            rrn,
            paymentMethod,
            paymentSystem,
            tokenProvider,
            bin,
            pan,
            domainRevisionFrom,
            domainRevisionTo,
            paymentAmountFrom,
            paymentAmountTo,
            paymentStatus,
        } = params;
        return this.merchantStatisticsService
            .SearchPayments(
                cleanPrimitiveProps({
                    common_search_query_params: clean({
                        from_time: moment(fromTime).utc().format(),
                        to_time: moment(toTime).utc().format(),
                        limit: SEARCH_LIMIT,
                        continuation_token: continuationToken,
                        party_id: partyID,
                        shop_ids: shopIDs,
                    }),
                    invoice_ids: clean(splitIds(invoiceIDs), true),
                    payment_params: clean({
                        payment_status: paymentStatus,
                        payment_tool: paymentMethod,
                        payment_email: payerEmail,
                        payment_first6: bin,
                        payment_system: { id: paymentSystem },
                        payment_last4: pan,
                        payment_provider_id: providerID,
                        payment_terminal_id: terminalID,
                        from_payment_domain_revision: domainRevisionFrom,
                        to_payment_domain_revision: domainRevisionTo,
                        payment_rrn: rrn,
                        payment_amount_from: paymentAmountFrom,
                        payment_amount_to: paymentAmountTo,
                        payment_token_provider: { id: tokenProvider },
                    }),
                })
            )
            .pipe(
                map(({ payments, continuation_token }) => ({
                    result: payments,
                    continuationToken: continuation_token,
                }))
            );
    }
}
