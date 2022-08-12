import { Injectable, NgZone } from '@angular/core';
import {
    InvoiceID,
    InvoicePaymentChargeback,
    InvoicePaymentChargebackID,
    InvoicePaymentID,
} from '@vality/domain-proto';
import {
    InvoicePaymentAdjustment,
    InvoicePaymentAdjustmentParams,
    InvoicePaymentChargebackParams,
    InvoiceRepairScenario,
} from '@vality/domain-proto/lib/payment_processing';
import * as Invoicing from '@vality/domain-proto/lib/payment_processing/gen-nodejs/Invoicing';
import {
    InvoicePaymentAdjustmentParams as InvoicePaymentAdjustmentParamsObject,
    InvoiceRepairScenario as InvoiceRepairScenarioObject,
} from '@vality/domain-proto/lib/payment_processing/gen-nodejs/payment_processing_types';
import { Observable, timer } from 'rxjs';
import { first, map, share, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';
import { createDamselInstance, damselInstanceToObject } from './utils/create-damsel-instance';

@Injectable()
/**
 * @deprecated
 */
export class PaymentProcessingService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/v1/processing/invoicing', Invoicing);
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

    createChargeback = (
        invoiceID: InvoiceID,
        paymentID: InvoicePaymentID,
        params: InvoicePaymentChargebackParams
    ): Observable<InvoicePaymentChargeback> =>
        this.toObservableAction('CreateChargeback')(
            createDamselInstance('domain', 'InvoiceID', invoiceID),
            createDamselInstance('domain', 'InvoicePaymentID', paymentID),
            createDamselInstance('payment_processing', 'InvoicePaymentChargebackParams', params)
        ).pipe(map((r) => damselInstanceToObject('domain', 'InvoicePaymentChargeback', r)));

    getChargeback = (
        invoiceID: InvoiceID,
        paymentID: InvoicePaymentID,
        chargebackID: InvoicePaymentChargebackID
    ): Observable<InvoicePaymentChargeback> =>
        this.toObservableAction('GetPaymentChargeback')(
            createDamselInstance('domain', 'InvoiceID', invoiceID),
            createDamselInstance('domain', 'InvoicePaymentID', paymentID),
            createDamselInstance('domain', 'InvoicePaymentChargebackID', chargebackID)
        ).pipe(map((r) => damselInstanceToObject('domain', 'InvoicePaymentChargeback', r)));
}
