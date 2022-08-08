import { Injectable } from '@angular/core';
import { StatPayment } from '@vality/magista-proto';
import { cleanObject } from '@vality/ng-core';
import { Observable, of, Subject } from 'rxjs';
import { mergeMap, shareReplay } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';

import { DomainService } from '../../domain';
import { SearchFormParams } from './search-form/search-form-params';

@Injectable()
export class PaymentAdjustmentService {
    searchPaymentChanges$: Subject<StatPayment[]> = new Subject<StatPayment[]>();

    domainVersion$: Observable<number> = this.domainService.version$.pipe(shareReplay(1));

    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private domainService: DomainService
    ) {}

    fetchPayments(params: SearchFormParams): Observable<StatPayment[]> {
        return this.getAllPayments(params);
    }

    private getAllPayments(
        params: SearchFormParams,
        continuationToken?: string,
        payments: StatPayment[] = []
    ): Observable<StatPayment[]> {
        return this.getPayments(params, continuationToken).pipe(
            mergeMap((res) => {
                const mergedPayments = [...payments, ...res.payments];
                this.searchPaymentChanges$.next(mergedPayments);
                return res.continuation_token
                    ? this.getAllPayments(params, res.continuation_token, mergedPayments)
                    : of(mergedPayments);
            })
        );
    }

    private getPayments(params: SearchFormParams, continuationToken?: string) {
        const {
            fromRevision,
            toRevision,
            partyId,
            fromTime,
            toTime,
            status,
            shopId,
            invoiceIds,
            providerID,
            terminalID,
        } = params;
        return this.merchantStatisticsService.SearchPayments(
            cleanObject({
                common_search_query_params: {
                    from_time: fromTime,
                    to_time: toTime,
                    party_id: partyId,
                    shop_ids: [shopId],
                    continuation_token: continuationToken,
                },
                payment_params: {
                    from_payment_domain_revision: fromRevision,
                    to_payment_domain_revision: toRevision,
                    payment_provider_id: providerID,
                    payment_terminal_id: terminalID,
                    payment_status: status,
                },
                invoice_ids: invoiceIds,
            })
        );
    }
}
