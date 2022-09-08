import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/lib/payment_processing';
import { BaseDialogSuperclass } from '@vality/ng-core';
import { from } from 'rxjs';
import * as short from 'short-uuid';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { DomainMetadataFormExtensionsService } from '@cc/app/shared/services';
import { ErrorService } from '@cc/app/shared/services/error';
import { NotificationService } from '@cc/app/shared/services/notification';

@UntilDestroy()
@Component({
    selector: 'cc-create-chargeback-dialog',
    templateUrl: './create-chargeback-dialog.component.html',
})
export class CreateChargebackDialogComponent extends BaseDialogSuperclass<
    CreateChargebackDialogComponent,
    { invoiceID: string; paymentID: string },
    InvoicePaymentChargeback
> {
    form = new FormControl<Partial<InvoicePaymentChargebackParams>>({ id: short().generate() });
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private domainMetadataFormExtensionsService: DomainMetadataFormExtensionsService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    create() {
        this.invoicingService
            .CreateChargeback(
                this.dialogData.invoiceID,
                this.dialogData.paymentID,
                this.form.value as InvoicePaymentChargebackParams
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: (res) => {
                    this.notificationService.success('Chargeback created');
                    this.closeWithSuccess(res);
                },
                error: (err) => {
                    this.errorService.error(err);
                    this.notificationService.error();
                },
            });
    }
}
