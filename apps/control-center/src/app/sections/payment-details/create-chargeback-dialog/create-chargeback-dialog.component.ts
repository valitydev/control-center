import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import { DialogSuperclass, getImportValue, NotifyLogService } from '@vality/matez';
import { ThriftAstMetadata } from '@vality/ng-thrift';
import short from 'short-uuid';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';

@Component({
    selector: 'cc-create-chargeback-dialog',
    templateUrl: './create-chargeback-dialog.component.html',
})
export class CreateChargebackDialogComponent extends DialogSuperclass<
    CreateChargebackDialogComponent,
    { invoiceID: string; paymentID: string },
    InvoicePaymentChargeback
> {
    form = new FormControl<Partial<InvoicePaymentChargebackParams>>({ id: short().generate() });
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(
        private invoicingService: InvoicingService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    create() {
        this.invoicingService
            .CreateChargeback(
                this.dialogData.invoiceID,
                this.dialogData.paymentID,
                this.form.value as InvoicePaymentChargebackParams,
            )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.log.success('Chargeback created');
                    this.closeWithSuccess(res);
                },
                error: this.log.error,
            });
    }
}
