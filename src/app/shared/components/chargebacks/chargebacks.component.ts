import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/magista-proto/lib/payment_processing';
import { BaseDialogService } from '@vality/ng-core';

import { InvoicingService } from '@cc/app/api/payment-processing';
import { AmountCurrencyPipe, ThriftPipesModule } from '@cc/app/shared';
import { TableModule, Columns } from '@cc/components/table';

import { ChangeChargebackStatusDialogComponent } from '../change-chargeback-status-dialog/change-chargeback-status-dialog.component';

@UntilDestroy()
@Component({
    standalone: true,
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    imports: [
        MatTableModule,
        TableModule,
        ThriftPipesModule,
        CommonModule,
        AmountCurrencyPipe,
        MatMenuModule,
    ],
})
export class ChargebacksComponent {
    @Input() chargebacks: InvoicePaymentChargeback[];
    @Input() paymentId: string;
    @Input() invoiceId: string;

    cols = new Columns('id', 'status', 'created_at', 'body', 'levy', 'stage', 'actions');

    constructor(
        private invoicingService: InvoicingService,
        private baseDialogService: BaseDialogService
    ) {}

    changeStatus(id: string) {
        this.baseDialogService.open(ChangeChargebackStatusDialogComponent, {
            paymentId: this.paymentId,
            invoiceId: this.invoiceId,
            id,
        });
    }
}
