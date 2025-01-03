import { Injectable } from '@angular/core';
import {
    payment_processing_InvoicingCodegenClient,
    ThriftAstMetadata,
    payment_processing_Invoicing,
} from '@vality/domain-proto';
import {
    InvoiceID,
    InvoicePaymentID,
    InvoicePaymentChargeback,
    InvoicePaymentChargebackID,
} from '@vality/domain-proto/domain';
import {
    InvoicePayment,
    InvoicePaymentChargebackParams,
    InvoicePaymentChargebackAcceptParams,
    InvoicePaymentChargebackRejectParams,
    InvoicePaymentChargebackReopenParams,
    InvoicePaymentAdjustmentParams,
    InvoicePaymentAdjustment,
    InvoicePaymentChargebackCancelParams,
} from '@vality/domain-proto/payment_processing';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ConfigService } from '../../core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../shared/services';

@Injectable({ providedIn: 'root' })
export class InvoicingService {
    private client$: Observable<payment_processing_InvoicingCodegenClient>;

    constructor(
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        configService: ConfigService,
    ) {
        const headers$ = this.keycloakTokenInfoService.info$.pipe(
            map(toWachterHeaders('Invoicing')),
        );
        const metadata$ = from(
            import('@vality/domain-proto/metadata.json').then(
                (m) => m.default as ThriftAstMetadata[],
            ),
        );
        this.client$ = combineLatest([metadata$, headers$]).pipe(
            switchMap(([metadata, headers]) =>
                payment_processing_Invoicing({
                    metadata,
                    headers,
                    logging: environment.logging.requests,
                    ...configService.config.api.wachter,
                }),
            ),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetPayment(id: InvoiceID, paymentId: InvoicePaymentID): Observable<InvoicePayment> {
        return this.client$.pipe(switchMap((c) => c.GetPayment(id, paymentId)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreatePaymentAdjustment(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        params: InvoicePaymentAdjustmentParams,
    ): Observable<InvoicePaymentAdjustment> {
        return this.client$.pipe(
            switchMap((c) => c.CreatePaymentAdjustment(id, paymentId, params)),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CreateChargeback(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        params: InvoicePaymentChargebackParams,
    ): Observable<InvoicePaymentChargeback> {
        return this.client$.pipe(switchMap((c) => c.CreateChargeback(id, paymentId, params)));
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    AcceptChargeback(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        chargebackId: InvoicePaymentChargebackID,
        params: InvoicePaymentChargebackAcceptParams,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.AcceptChargeback(id, paymentId, chargebackId, params)),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    RejectChargeback(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        chargebackId: InvoicePaymentChargebackID,
        params: InvoicePaymentChargebackRejectParams,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.RejectChargeback(id, paymentId, chargebackId, params)),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    ReopenChargeback(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        chargebackId: InvoicePaymentChargebackID,
        params: InvoicePaymentChargebackReopenParams,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.ReopenChargeback(id, paymentId, chargebackId, params)),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    CancelChargeback(
        id: InvoiceID,
        paymentId: InvoicePaymentID,
        chargebackId: InvoicePaymentChargebackID,
        params: InvoicePaymentChargebackCancelParams,
    ): Observable<void> {
        return this.client$.pipe(
            switchMap((c) => c.CancelChargeback(id, paymentId, chargebackId, params)),
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    GetEvents(...args: Parameters<payment_processing_InvoicingCodegenClient['GetEvents']>) {
        return this.client$.pipe(switchMap((c) => c.GetEvents(...args)));
    }
}
