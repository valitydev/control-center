import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { DialogService } from '@vality/ng-core';

import { AmountCurrencyPipe, ThriftPipesModule } from '@cc/app/shared';
import { DetailsDialogComponent } from '@cc/app/shared/components/details-dialog/details-dialog.component';
import { TableModule, Columns } from '@cc/components/table';

import { ChangeChargebacksStatusDialogComponent } from '../change-chargebacks-status-dialog';

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

    constructor(private dialogService: DialogService) {}

    changeStatus(id: string) {
        this.dialogService.open(ChangeChargebacksStatusDialogComponent, {
            chargebacks: [
                {
                    payment_id: this.paymentId,
                    invoice_id: this.invoiceId,
                    chargeback_id: id,
                },
            ],
        });
    }

    showDetails(chargeback: InvoicePaymentChargeback) {
        this.dialogService.open(DetailsDialogComponent, {
            title: 'Chargeback details',
            json: chargeback,
        });
    }
}
