import short from 'short-uuid';

import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

import { metadata$ } from '@vality/domain-proto';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { InvoicePaymentChargebackParams, Invoicing } from '@vality/domain-proto/payment_processing';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';

import { DomainMetadataFormExtensionsService } from '~/shared/components/thrift-api-crud';

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
    private invoicingService = inject(Invoicing);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    form = new FormControl<Partial<InvoicePaymentChargebackParams>>({ id: short().generate() });
    metadata$ = metadata$;
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
