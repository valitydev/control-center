import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { InvoicePaymentChargeback } from '@vality/domain-proto';

import { TableModule } from '../../../../components/table';

@Component({
    standalone: true,
    selector: 'cc-chargebacks',
    templateUrl: './chargebacks.component.html',
    imports: [MatTableModule, TableModule],
})
export class ChargebacksComponent {
    @Input() chargebacks: InvoicePaymentChargeback[];
    selection: SelectionModel<InvoicePaymentChargeback>;
    displayedColumns = ['id'];
}
