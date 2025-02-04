import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { StatChargeback } from '@vality/magista-proto/internal/magista';
import {
    DialogModule,
    DialogSuperclass,
    EnumKeyPipe,
    EnumKeysPipe,
    NotifyLogService,
    forkJoinToResult,
    getImportValue,
} from '@vality/matez';
import { ThriftAstMetadata, ThriftFormModule } from '@vality/ng-thrift';
import { BehaviorSubject } from 'rxjs';

import { InvoicingService } from '../../../api/payment-processing/invoicing.service';
import { DomainMetadataFormExtensionsService } from '../../services';

enum Action {
    Accept,
    Reject,
    Reopen,
    Cancel,
}

const CHANGE_STATUS_METHODS = {
    [Action.Accept]: 'AcceptChargeback',
    [Action.Reject]: 'RejectChargeback',
    [Action.Reopen]: 'ReopenChargeback',
    [Action.Cancel]: 'CancelChargeback',
} as const;

@Component({
    templateUrl: './change-chargebacks-status-dialog.component.html',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        ThriftFormModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        EnumKeysPipe,
        EnumKeyPipe,
    ],
})
export class ChangeChargebacksStatusDialogComponent
    extends DialogSuperclass<
        ChangeChargebacksStatusDialogComponent,
        { chargebacks: Pick<StatChargeback, 'chargeback_id' | 'invoice_id' | 'payment_id'>[] }
    >
    implements OnInit
{
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    control = new FormControl();
    actionControl = new FormControl<Action>(null, Validators.required);
    typeEnum = Action;
    types = {
        [Action.Accept]: 'InvoicePaymentChargebackAcceptParams',
        [Action.Reject]: 'InvoicePaymentChargebackRejectParams',
        [Action.Reopen]: 'InvoicePaymentChargebackReopenParams',
        [Action.Cancel]: 'InvoicePaymentChargebackCancelParams',
    };
    progress$ = new BehaviorSubject(0);

    constructor(
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngOnInit() {
        this.actionControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.control.reset();
        });
    }

    confirm() {
        forkJoinToResult(
            this.dialogData.chargebacks.map((c) =>
                this.invoicingService[CHANGE_STATUS_METHODS[this.actionControl.value]](
                    c.invoice_id,
                    c.payment_id,
                    c.chargeback_id,
                    this.control.value,
                ),
            ),
            this.progress$,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    const withErrors = res.filter((r) => r.hasError);
                    if (withErrors.length) {
                        this.log.error(
                            withErrors.map((e) => e.error),
                            `Error changing the status of ${withErrors.length} chargebacks`,
                        );
                    } else {
                        this.log.success('Chargebacks status changed successfully');
                    }
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
