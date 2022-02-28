import { Component } from '@angular/core';

@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.scss'],
})
export class PayoutsComponent {
    progress$;
    payouts$;
    hasMore$;

    fetchMore() {}
}
