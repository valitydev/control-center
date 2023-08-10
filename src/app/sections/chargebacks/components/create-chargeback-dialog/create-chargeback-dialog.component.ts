import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InvoicePaymentChargebackParams } from '@vality/domain-proto/payment_processing';
import { StatChargeback } from '@vality/magista-proto/magista';
import { DialogSuperclass, NotifyLogService } from '@vality/ng-core';
import { of } from 'rxjs';
import * as short from 'short-uuid';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

@UntilDestroy()
@Component({
    selector: 'cc-create-chargeback-dialog',
    templateUrl: './create-chargeback-dialog.component.html',
})
export class CreateChargebackDialogComponent extends DialogSuperclass<
    CreateChargebackDialogComponent,
    { chargeback?: Pick<StatChargeback, 'invoice_id' | 'payment_id'> }
> {
    form = new FormControl<Partial<InvoicePaymentChargebackParams>>({ id: short().generate() });
    paymentControl = new FormControl(this.dialogData?.chargeback?.payment_id);
    invoiceControl = new FormControl(this.dialogData?.chargeback?.invoice_id);
    extensions$ = of([]);

    constructor(
        injector: Injector,
        private invoicingService: InvoicingService,
        private notificationErrorService: NotificationErrorService,
        private log: NotifyLogService,
    ) {
        super(injector);
    }

    create() {
        this.invoicingService
            .CreateChargeback(
                this.invoiceControl.value,
                this.paymentControl.value,
                this.form.value as InvoicePaymentChargebackParams,
            )
            .pipe(untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.log.success('Chargeback created');
                    this.closeWithSuccess();
                },
                error: this.notificationErrorService.error,
            });
    }
}
