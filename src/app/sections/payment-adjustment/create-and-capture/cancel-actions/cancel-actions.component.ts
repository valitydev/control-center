import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';
import forEach from 'lodash-es/forEach';
import groupBy from 'lodash-es/groupBy';

import {
    AdjustmentOperationEvent,
    BatchPaymentAdjustmentService,
    CancelPaymentAdjustmentErrorCodes,
    EventType,
    OperationFailedPayload,
    PaymentAdjustmentCancelParams,
} from '../adjustment-operations';

type FailedPayload = OperationFailedPayload<string, PaymentAdjustmentCancelParams>;

@Component({
    selector: 'cc-cancel-actions',
    templateUrl: 'cancel-actions.component.html',
})
export class CancelActionsComponent implements OnInit {
    @Input()
    adjustmentParams: InvoicePaymentAdjustmentParams;

    @Input()
    isLoading = false;

    cancelResult: PaymentAdjustmentCancelParams[] = [];
    failedInvalidStatus: FailedPayload[] = [];
    failedAdjustmentNotFound: FailedPayload[] = [];
    failedInvoiceNotFound: FailedPayload[] = [];
    failedInvalidUser: FailedPayload[] = [];
    failedInternal: FailedPayload[] = [];
    failedInvoicePaymentNotFound: FailedPayload[] = [];

    constructor(
        private batchAdjustmentService: BatchPaymentAdjustmentService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.batchAdjustmentService.events$.subscribe((event) => {
            switch (event.type) {
                case EventType.PaymentAdjustmentsCancelled:
                    this.cancelResult = this.cancelResult.concat(
                        (event as AdjustmentOperationEvent<PaymentAdjustmentCancelParams>).payload
                    );
                    break;
                case EventType.CancelPaymentAdjustmentFailed: {
                    const infoGroup = groupBy<any>(event.payload, 'code');
                    forEach(infoGroup, (payloads, code) => {
                        switch (code) {
                            case CancelPaymentAdjustmentErrorCodes.InvalidPaymentAdjustmentStatus:
                                this.failedInvalidStatus =
                                    this.failedInvalidStatus.concat(payloads);
                                break;
                            case CancelPaymentAdjustmentErrorCodes.InvoicePaymentAdjustmentNotFound:
                                this.failedAdjustmentNotFound =
                                    this.failedAdjustmentNotFound.concat(payloads);
                                break;
                            case CancelPaymentAdjustmentErrorCodes.InvoiceNotFound:
                                this.failedInvoiceNotFound =
                                    this.failedInvoiceNotFound.concat(payloads);
                                break;
                            case CancelPaymentAdjustmentErrorCodes.InvalidUser:
                                this.failedInvalidUser = this.failedInvalidUser.concat(payloads);
                                break;
                            case CancelPaymentAdjustmentErrorCodes.InvoicePaymentNotFound:
                                this.failedInvoicePaymentNotFound =
                                    this.failedInvoicePaymentNotFound.concat(payloads);
                                break;
                            case 'InternalServer':
                                this.failedInternal = this.failedInternal.concat(payloads);
                                break;
                        }
                    });
                    break;
                }
            }
        });
    }

    recreate() {
        const createParams = this.cancelResult.map(({ invoice_id, payment_id }) => ({
            invoice_id,
            payment_id,
            params: this.adjustmentParams,
        }));
        this.cancelResult = [];
        this.batchAdjustmentService.create(createParams).subscribe({
            error: () => {
                this.snackBar.open('An error occurred while adjustments create');
            },
        });
    }

    retry() {
        const cancelParams = this.failedInternal.map(({ operationScope }) => operationScope);
        this.failedInternal = [];
        this.batchAdjustmentService.cancel(cancelParams).subscribe({
            error: () => {
                this.snackBar.open('An error occurred while adjustments cancel');
            },
        });
    }
}
