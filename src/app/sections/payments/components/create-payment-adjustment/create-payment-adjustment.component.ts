import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/payment_processing';
import { StatPayment } from '@vality/magista-proto/magista';
import {
    DialogSuperclass,
    NotifyLogService,
    forkJoinToResult,
    splitResultsErrors,
    ForkJoinErrorResult,
    getImportValue,
} from '@vality/ng-core';
import { ThriftAstMetadata } from '@vality/ng-thrift';
import { BehaviorSubject } from 'rxjs';

import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

import { InvoicingService } from '../../../../api/payment-processing';

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
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    errors: ForkJoinErrorResult<StatPayment>[] = [];

    constructor(
        private invoicingService: InvoicingService,
        private log: NotifyLogService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private destroyRef: DestroyRef,
    ) {
        super();
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
