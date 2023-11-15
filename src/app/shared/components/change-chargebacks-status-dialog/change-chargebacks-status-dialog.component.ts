import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { StatChargeback } from '@vality/magista-proto/internal/magista';
import {
    DialogSuperclass,
    DialogModule,
    forkJoinToResult,
    NotifyLogService,
    EnumKeysPipe,
    EnumKeyPipe,
} from '@vality/ng-core';
import { from, BehaviorSubject } from 'rxjs';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

import { MetadataFormModule } from '../metadata-form';

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

@UntilDestroy()
@Component({
    standalone: true,
    templateUrl: './change-chargebacks-status-dialog.component.html',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        MetadataFormModule,
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
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
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
        injector: Injector,
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.actionControl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
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
            4,
            this.progress$,
        )
            .pipe(untilDestroyed(this))
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
