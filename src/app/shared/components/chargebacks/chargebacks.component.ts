import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { UntilDestroy } from '@ngneat/until-destroy';
import { InvoicePaymentChargeback } from '@vality/domain-proto/domain';
import { BaseDialogService } from '@vality/ng-core';

import { AmountCurrencyPipe, ThriftPipesModule } from '@cc/app/shared';
import { DetailsDialogComponent } from '@cc/app/shared/components/details-dialog/details-dialog.component';
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

    constructor(private baseDialogService: BaseDialogService) {}

    changeStatus(id: string) {
        this.baseDialogService.open(ChangeChargebackStatusDialogComponent, {
            paymentId: this.paymentId,
            invoiceId: this.invoiceId,
            id,
        });
    }

    showDetails(chargeback: InvoicePaymentChargeback) {
        this.baseDialogService.open(DetailsDialogComponent, {
            title: 'Chargeback details',
            json: chargeback,
        });
    }
}
