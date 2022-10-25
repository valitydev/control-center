import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';
import { StatPayment } from '@vality/magista-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';
import chunk from 'lodash-es/chunk';
import { BehaviorSubject, from, concatMap, of, forkJoin } from 'rxjs';
import { catchError, finalize, delay } from 'rxjs/operators';

import { InvoicingService } from '../../../../api/payment-processing';
import { NotificationService } from '../../../services/notification';
import { MetadataFormExtension, isTypeWithAliases } from '../../metadata-form';

@UntilDestroy()
@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
})
export class CreatePaymentAdjustmentComponent extends BaseDialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] },
    { withError?: StatPayment[] }
> {
    control = new FormControl<InvoicePaymentAdjustmentParams>(null);
    progress$ = new BehaviorSubject(0);
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions: MetadataFormExtension[] = [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'FailureCode', 'domain')),
            extension: () =>
                of({
                    options: [
                        'authorization_failed:unknown',
                        'authorization_failed:insufficient_funds',
                        'authorization_failed:payment_tool_rejected:bank_card_rejected:card_expired',
                        'authorization_failed:rejected_by_issuer',
                        'authorization_failed:operation_blocked',
                        'authorization_failed:account_stolen',
                        'authorization_failed:temporarily_unavailable',
                        'authorization_failed:account_limit_exceeded:number',
                        'authorization_failed:account_limit_exceeded:amount',
                        'authorization_failed:security_policy_violated',
                        'preauthorization_failed',
                        'authorization_failed:payment_tool_rejected:bank_card_rejected:cvv_invalid',
                        'authorization_failed:account_not_found',
                        'authorization_failed:payment_tool_rejected:bank_card_rejected:card_number_invalid',
                        'authorization_failed:rejected_by_issuer',
                    ]
                        .sort()
                        .map((value) => ({ value })),
                }),
        },
    ];
    withError: StatPayment[] = [];

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    create() {
        const payments = this.withError.length ? this.withError : this.dialogData.payments;
        this.withError = [];
        const progressStep = 100 / (payments.length + 1);
        this.progress$.next(progressStep);
        of(...chunk(payments, 4))
            .pipe(
                concatMap((payments) =>
                    forkJoin(
                        payments.map((p) =>
                            this.invoicingService
                                .CreatePaymentAdjustment(p.invoice_id, p.id, this.control.value)
                                .pipe(
                                    delay(Math.random() * 10000),
                                    catchError(() => {
                                        this.withError.push(p);
                                        return null;
                                    }),
                                    finalize(() =>
                                        this.progress$.next(this.progress$.value + progressStep)
                                    )
                                )
                        )
                    )
                ),
                untilDestroyed(this)
            )
            .subscribe({
                complete: () => {
                    if (!this.withError.length) {
                        this.notificationService.success(`${payments.length} created successfully`);
                        this.closeWithSuccess();
                    } else {
                        this.notificationService.error(
                            `${this.withError.length} out of ${payments.length} failed`
                        );
                    }
                    this.progress$.next(0);
                },
            });
    }

    closeAndSelectWithAnError() {
        this.closeWithError({ withError: this.withError });
    }
}
