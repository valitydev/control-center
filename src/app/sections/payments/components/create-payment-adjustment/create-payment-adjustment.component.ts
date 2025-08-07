import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { metadata$ } from '@vality/domain-proto';
import { InvoicePaymentAdjustmentParams, Invoicing } from '@vality/domain-proto/payment_processing';
import { StatPayment } from '@vality/magista-proto/magista';
import {
    DialogSuperclass,
    ForkJoinErrorResult,
    NotifyLogService,
    forkJoinToResult,
    splitResultsErrors,
} from '@vality/matez';
import { BehaviorSubject } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '../../../../shared/services';

@Component({
    selector: 'cc-create-payment-adjustment',
    templateUrl: './create-payment-adjustment.component.html',
    standalone: false,
})
export class CreatePaymentAdjustmentComponent extends DialogSuperclass<
    CreatePaymentAdjustmentComponent,
    { payments: StatPayment[] },
    { errors?: ForkJoinErrorResult<StatPayment>[] }
> {
    private invoicingService = inject(Invoicing);
    private log = inject(NotifyLogService);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    private destroyRef = inject(DestroyRef);
    control = new FormControl<InvoicePaymentAdjustmentParams>(null);
    progress$ = new BehaviorSubject(0);
    metadata$ = metadata$;
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    errors: ForkJoinErrorResult<StatPayment>[] = [];

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
            2,
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
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
