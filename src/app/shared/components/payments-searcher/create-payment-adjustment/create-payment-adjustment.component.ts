import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';
import { StatPayment } from '@vality/magista-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject, from, bufferCount, concatMap, forkJoin, of } from 'rxjs';

import { progressTo } from '../../../../../utils';
import { InvoicingService } from '../../../../api/payment-processing';
import { MetadataFormExtension, isTypeWithAliases } from '../../metadata-form';

@UntilDestroy()
@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
})
export class CreatePaymentAdjustmentComponent extends BaseDialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] }
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

    constructor(injector: Injector, private invoicingService: InvoicingService) {
        super(injector);
    }

    create() {
        from(this.dialogData.payments)
            .pipe(
                bufferCount(4),
                concatMap((payments) =>
                    forkJoin(
                        payments.map((p) =>
                            this.invoicingService
                                .CreatePaymentAdjustment(p.invoice_id, p.id, this.control.value)
                                .pipe(progressTo(this.progress$))
                        )
                    )
                ),
                untilDestroyed(this)
            )
            .subscribe(() => {
                // this.closeWithSuccess();
            });
    }
}
