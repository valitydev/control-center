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
    ChargebackSearchQuery,
} from '@vality/magista-proto/magista';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { KeycloakTokenInfoService, toWachterHeaders } from '@cc/app/shared/services';
import { environment } from '@cc/environments/environment';

import { ConfigService } from '../../core/config.service';

@Injectable({ providedIn: 'root' })
export class MerchantStatisticsService {
    private client$: Observable<magista_MerchantStatisticsServiceCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('MerchantStatistics')),
        );
        const metadata$ = from(
            import('@vality/magista-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                magista_MerchantStatisticsService({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
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
    SearchChargebacks(chargebackSearchQuery: ChargebackSearchQuery) {
        return this.client$.pipe(switchMap((c) => c.SearchChargebacks(chargebackSearchQuery)));
    }
}
