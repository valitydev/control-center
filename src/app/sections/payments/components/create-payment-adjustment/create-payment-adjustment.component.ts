import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/payment_processing';
import { StatPayment } from '@vality/magista-proto/magista';
import {
    DialogSuperclass,
    NotifyLogService,
    forkJoinToResult,
    splitResultsErrors,
    ForkJoinErrorResult,
} from '@vality/ng-core';
import { BehaviorSubject, from } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

import { InvoicingService } from '../../../../api/payment-processing';

@UntilDestroy()
@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
})
export class CreatePaymentAdjustmentComponent extends DialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] },
    { errors?: ForkJoinErrorResult<StatPayment>[] }
> {
    control = new FormControl<InvoicePaymentAdjustmentParams>(null);
    progress$ = new BehaviorSubject(0);
    metadata$ = from(import('@vality/domain-proto/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    errors: ForkJoinErrorResult<StatPayment>[] = [];

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
    ) {
        super(injector);
    }

    create() {
        const payments = this.errors.length
            ? this.errors.map(({ data }) => data)
            : this.dialogData.payments;
        this.errors = [];
        forkJoinToResult(
            payments.map((p) =>
                this.invoicingService.CreatePaymentAdjustment(
                    p.invoice_id,
                    p.id,
                    this.control.value,
                ),
            ),
            this.progress$,
            payments,
        )
            .pipe(untilDestroyed(this))
            .subscribe((res) => {
                const [result, errors] = splitResultsErrors(res);
                if (errors.length) {
                    this.errors = errors;
                    this.log.error(this.errors.map((e) => e.error));
                } else {
                    this.log.success(`${result.length} created successfully`);
                    this.closeWithSuccess();
                }
            });
    }

    closeAndSelectWithAnError() {
        this.closeWithError({ errors: this.errors });
    }
}
