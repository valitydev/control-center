import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PayoutManagementService } from '@cc/app/api/payout-manager';

import { PartyService } from '../../../papi/party.service';

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
    shop$ = this.payout$.pipe(
        switchMap(({ party_id, shop_id }) => this.partyService.getShop(party_id, shop_id)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(
        private route: ActivatedRoute,
        private payoutManagementService: PayoutManagementService,
        private partyService: PartyService
    ) {}
}
