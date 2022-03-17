import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PayoutManagementService } from '@cc/app/api/payout-manager';

@Component({
    selector: 'cc-payout-details',
    templateUrl: './payout-details.component.html',
    styleUrls: ['./payout-details.component.scss'],
})
export class PayoutDetailsComponent {
    payout$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        pluck('payoutId'),
        switchMap((id: string) => this.payoutManagementService.getPayout(id)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(
        private route: ActivatedRoute,
        private payoutManagementService: PayoutManagementService
    ) {}
}
