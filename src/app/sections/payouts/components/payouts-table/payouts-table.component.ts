import { Component, Input } from '@angular/core';
import { StatPayout } from '@vality/magista-proto';

@Component({
    selector: 'cc-payouts-table',
    templateUrl: './payouts-table.component.html',
})
export class PayoutsTableComponent {
    @Input() payouts: StatPayout[];
}
