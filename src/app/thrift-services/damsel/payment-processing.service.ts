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
    UserInfo,
} from '@vality/domain-proto/lib/payment_processing';
import * as Invoicing from '@vality/domain-proto/lib/payment_processing/gen-nodejs/Invoicing';
import {
    InvoicePaymentAdjustmentParams as InvoicePaymentAdjustmentParamsObject,
    InvoiceRepairScenario as InvoiceRepairScenarioObject,
    UserInfo as UserInfoObject,
} from '@vality/domain-proto/lib/payment_processing/gen-nodejs/payment_processing_types';
import { KeycloakService } from 'keycloak-angular';
import { Observable, timer } from 'rxjs';
import { first, map, share, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';
import { createDamselInstance, damselInstanceToObject } from './utils/create-damsel-instance';

@Injectable()
export class PaymentProcessingService extends ThriftService {
    constructor(
        zone: NgZone,
        keycloakTokenInfoService: KeycloakTokenInfoService,
        private keycloakService: KeycloakService
    ) {
        super(zone, keycloakTokenInfoService, '/v1/processing/invoicing', Invoicing);
    }

    getPaymentAdjustment = (
        user: UserInfo,
        id: string,
        paymentId: string,
        paymentAdjustmentId: string
    ): Observable<InvoicePaymentAdjustment> =>
        this.toObservableAction('GetPaymentAdjustment')(
            new UserInfoObject(user),
            id,
            paymentId,
            paymentAdjustmentId
        );

    createPaymentAdjustment = (
        user: UserInfo,
        id: string,
        paymentId: string,
        params: InvoicePaymentAdjustmentParams
    ): Observable<InvoicePaymentAdjustment> =>
        this.toObservableAction('CreatePaymentAdjustment')(
            new UserInfoObject(user),
            id,
            paymentId,
            new InvoicePaymentAdjustmentParamsObject(params)
        ).pipe(
            switchMap((paymentAdjustment: InvoicePaymentAdjustment) =>
                timer(1000, 2500).pipe(
                    switchMap(() =>
                        this.getPaymentAdjustment(user, id, paymentId, paymentAdjustment.id)
                    ),
                    first(({ status }: InvoicePaymentAdjustment) => !status.pending)
                )
            ),
            share()
        );

    capturePaymentAdjustment = (
        user: UserInfo,
        id: string,
        paymentId: string,
        adjustmentId: string
    ): Observable<void> =>
        this.toObservableAction('CapturePaymentAdjustment')(
            new UserInfoObject(user),
            id,
            paymentId,
            adjustmentId
        );

    cancelPaymentAdjustment = (
        user: UserInfo,
        id: string,
        paymentId: string,
        adjustmentId: string
    ): Observable<void> =>
        this.toObservableAction('CancelPaymentAdjustment')(
            new UserInfoObject(user),
            id,
            paymentId,
            adjustmentId
        );

    repairWithScenario = (
        user: UserInfo,
        id: InvoiceID,
        scenario: InvoiceRepairScenario
    ): Observable<void> =>
        this.toObservableAction('RepairWithScenario')(
            new UserInfoObject(user),
            id,
            new InvoiceRepairScenarioObject(scenario)
        );

    createChargeback = (
        invoiceID: InvoiceID,
        paymentID: InvoicePaymentID,
        params: InvoicePaymentChargebackParams
    ): Observable<InvoicePaymentChargeback> =>
        this.toObservableAction('CreateChargeback')(
            this.getUser(),
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
            this.getUser(),
            createDamselInstance('domain', 'InvoiceID', invoiceID),
            createDamselInstance('domain', 'InvoicePaymentID', paymentID),
            createDamselInstance('domain', 'InvoicePaymentChargebackID', chargebackID)
        ).pipe(map((r) => damselInstanceToObject('domain', 'InvoicePaymentChargeback', r)));

    private getUser(): UserInfo {
        return createDamselInstance('payment_processing', 'UserInfo', {
            id: this.keycloakService.getUsername(),
            type: { internal_user: {} },
        });
    }
}
