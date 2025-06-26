import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import { DialogSuperclass, NotifyLogService, getImportValue } from '@vality/matez';
import { ThriftAstMetadata } from '@vality/ng-thrift';
import short from 'short-uuid';

import { InvoicingService } from '../../../api/payment-processing/invoicing.service';
import { DomainMetadataFormExtensionsService } from '../../../shared/services';

@Component({
    selector: 'cc-create-chargeback-dialog',
    templateUrl: './create-chargeback-dialog.component.html',
    standalone: false,
})
export class CreateChargebackDialogComponent extends DialogSuperclass<
    CreateChargebackDialogComponent,
    { invoiceID: string; paymentID: string },
    InvoicePaymentChargeback
> {
    private invoicingService = inject(InvoicingService);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    form = new FormControl<Partial<InvoicePaymentChargebackParams>>({ id: short().generate() });
    metadata$ = getImportValue<ThriftAstMetadata[]>(import('@vality/domain-proto/metadata.json'));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

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
