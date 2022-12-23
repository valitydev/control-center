import { Injectable } from '@angular/core';
import {
    magista_MerchantStatisticsServiceCodegenClient,
    ThriftAstMetadata,
    magista_MerchantStatisticsService,
} from '@vality/magista-proto';
import {
    PaymentSearchQuery,
    StatPaymentResponse,
    RefundSearchQuery,
    StatRefundResponse,
    PayoutSearchQuery,
    StatPayoutResponse,
} from '@vality/magista-proto/magista';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

@Injectable({ providedIn: 'root' })
export class MerchantStatisticsService {
    private client$: Observable<magista_MerchantStatisticsServiceCodegenClient>;

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {
        const headers$ = this.keycloakTokenInfoService.decoded$.pipe(
            map(toWachterHeaders('MerchantStatistics'))
        );
        const metadata$ = from(
            import('@vality/magista-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[]
            )
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                magista_MerchantStatisticsService({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    path: '/wachter',
                })
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchPayments(paymentSearchQuery: PaymentSearchQuery): Observable<StatPaymentResponse> {
        return this.client$.pipe(switchMap((c) => c.SearchPayments(paymentSearchQuery)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchRefunds(refundSearchQuery: RefundSearchQuery): Observable<StatRefundResponse> {
        return this.client$.pipe(switchMap((c) => c.SearchRefunds(refundSearchQuery)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    SearchPayouts(payoutSearchQuery: PayoutSearchQuery): Observable<StatPayoutResponse> {
        return this.client$.pipe(switchMap((c) => c.SearchPayouts(payoutSearchQuery)));
    }
}
