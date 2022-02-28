import { Component, Input } from '@angular/core';

import { Payout } from '@cc/app/api/damsel/gen-model/payout_processing';

@Component({
    selector: 'cc-payouts-table',
    templateUrl: './payouts-table.component.html',
})
export class PayoutsTableComponent {
    @Input() payouts: Payout[];
}
