import { Injectable, NgZone } from '@angular/core';
import { InvoiceID } from '@vality/domain-proto';
import {
    InvoicePaymentAdjustment,
    InvoicePaymentAdjustmentParams,
    InvoiceRepairScenario,
} from '@vality/domain-proto/lib/payment_processing';
import * as Invoicing from '@vality/domain-proto/lib/payment_processing/gen-nodejs/Invoicing';
import {
    InvoicePaymentAdjustmentParams as InvoicePaymentAdjustmentParamsObject,
    InvoiceRepairScenario as InvoiceRepairScenarioObject,
} from '@vality/domain-proto/lib/payment_processing/gen-nodejs/payment_processing_types';
import { KeycloakService } from 'keycloak-angular';
import { Observable, timer } from 'rxjs';
import { first, share, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
/**
 * @deprecated
 */
export class PaymentProcessingService extends ThriftService {
    constructor(
        zone: NgZone,
        keycloakTokenInfoService: KeycloakTokenInfoService,
        keycloakService: KeycloakService
    ) {
        super(zone, keycloakTokenInfoService, keycloakService, '/wachter', Invoicing, 'Invoicing');
    }

    getPaymentAdjustment = (
        id: string,
        paymentId: string,
        paymentAdjustmentId: string
    ): Observable<InvoicePaymentAdjustment> =>
        this.toObservableAction('GetPaymentAdjustment')(id, paymentId, paymentAdjustmentId);

    createPaymentAdjustment = (
        id: string,
        paymentId: string,
        params: InvoicePaymentAdjustmentParams
    ): Observable<InvoicePaymentAdjustment> =>
        this.toObservableAction('CreatePaymentAdjustment')(
            id,
            paymentId,
            new InvoicePaymentAdjustmentParamsObject(params)
        ).pipe(
            switchMap((paymentAdjustment: InvoicePaymentAdjustment) =>
                timer(1000, 2500).pipe(
                    switchMap(() => this.getPaymentAdjustment(id, paymentId, paymentAdjustment.id)),
                    first(({ status }: InvoicePaymentAdjustment) => !status.pending)
                )
            ),
            share()
        );

    capturePaymentAdjustment = (
        id: string,
        paymentId: string,
        adjustmentId: string
    ): Observable<void> =>
        this.toObservableAction('CapturePaymentAdjustment')(id, paymentId, adjustmentId);

    cancelPaymentAdjustment = (
        id: string,
        paymentId: string,
        adjustmentId: string
    ): Observable<void> =>
        this.toObservableAction('CancelPaymentAdjustment')(id, paymentId, adjustmentId);

    repairWithScenario = (id: InvoiceID, scenario: InvoiceRepairScenario): Observable<void> =>
        this.toObservableAction('RepairWithScenario')(
            id,
            new InvoiceRepairScenarioObject(scenario)
        );
}
