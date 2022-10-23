import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentAdjustmentParams } from '@vality/domain-proto/lib/payment_processing';
import { StatPayment } from '@vality/magista-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';
import { BehaviorSubject, from } from 'rxjs';

import { InvoicingService } from '../../../../api/payment-processing';

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

    constructor(injector: Injector, private invoicingService: InvoicingService) {
        super(injector);
    }

    create() {
        this.closeWithSuccess();
    }
}
