import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PayoutID, PayoutStatus, StatPayout } from '@vality/magista-proto';

import { StatusColor } from '@cc/app/shared/components/status/types/status-color';

@Component({
    selector: 'cc-payouts-table',
    templateUrl: './payouts-table.component.html',
    styleUrls: ['./payouts-table.component.scss'],
})
export class PayoutsTableComponent {
    @Input() payouts: StatPayout[];

    displayedColumns: string[] = [
        'id',
        'party',
        'shop',
        'createdAt',
        'status',
        'amount',
        'fee',
        'payoutToolType',
        'actions',
    ];

    constructor(private router: Router) {}

    async navigateToPayout(id: PayoutID) {
        await this.router.navigate([`/payouts/${id}`]);
    }

    getColorByStatus(status: keyof PayoutStatus) {
        switch (status) {
            case 'confirmed':
                return StatusColor.Success;
            case 'paid':
                return StatusColor.Pending;
            case 'cancelled':
            case 'unpaid':
                return StatusColor.Warn;
            default:
                return StatusColor.Neutral;
        }
    }
}
