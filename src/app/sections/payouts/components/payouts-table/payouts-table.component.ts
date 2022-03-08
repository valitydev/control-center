import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PayoutID, StatPayout } from '@vality/magista-proto';

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
}
