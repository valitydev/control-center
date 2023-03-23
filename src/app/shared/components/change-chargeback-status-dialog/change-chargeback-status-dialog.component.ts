import { CommonModule } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { GridModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatSelectModule } from '@angular/material/select';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { BaseDialogSuperclass, BaseDialogModule } from '@vality/ng-core';
import { from, BehaviorSubject, Observable } from 'rxjs';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { EnumKeysPipe, EnumKeyPipe } from '@cc/app/shared';
import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';
import { NotificationService } from '@cc/app/shared/services/notification';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { progressTo } from '@cc/utils';

import { MetadataFormModule } from '../metadata-form';

enum Action {
    Accept,
    Reject,
    Reopen,
    Cancel,
}

@UntilDestroy()
@Component({
    standalone: true,
    selector: 'cc-change-chargeback-status-dialog',
    templateUrl: './change-chargeback-status-dialog.component.html',
    imports: [
        CommonModule,
        BaseDialogModule,
        MatButtonModule,
        MetadataFormModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        EnumKeysPipe,
        GridModule,
        EnumKeyPipe,
    ],
})
export class ChangeChargebackStatusDialogComponent
    extends BaseDialogSuperclass<
        ChangeChargebackStatusDialogComponent,
        { id: string; paymentId: string; invoiceId: string }
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
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.actionControl.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
            this.control.reset();
        });
    }

    confirm() {
        let action$: Observable<void>;
        const args = [
            this.dialogData.invoiceId,
            this.dialogData.paymentId,
            this.dialogData.id,
            this.control.value,
        ] as const;
        switch (this.actionControl.value) {
            case Action.Accept:
                action$ = this.invoicingService.AcceptChargeback(...args);
                break;
            case Action.Reject:
                action$ = this.invoicingService.RejectChargeback(...args);
                break;
            case Action.Reopen:
                action$ = this.invoicingService.ReopenChargeback(...args);
                break;
            case Action.Cancel:
                action$ = this.invoicingService.CancelChargeback(...args);
                break;
        }
        action$.pipe(progressTo(this.progress$), untilDestroyed(this)).subscribe({
            next: () => {
                this.notificationService.success();
            },
            error: (err) => {
                this.notificationErrorService.error(err);
            },
        });
    }
}
