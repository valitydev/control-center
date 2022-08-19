import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { InvoicePaymentRefundStatus } from '@vality/domain-proto/lib/merch_stat';

import { Refund } from '../../../../query-dsl/refund';

@Component({
    selector: 'cc-refunds-table',
    templateUrl: 'refunds-table.component.html',
    styleUrls: ['refunds-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundsTableComponent {
    @Input() refunds: Refund[];

    mapStatus: { [N in keyof InvoicePaymentRefundStatus] } = {
        pending: 'Pending',
        succeeded: 'Succeeded',
        failed: 'Failed',
    };
    displayedColumns = ['createdAt', 'status', 'amount', 'reason'];
}
