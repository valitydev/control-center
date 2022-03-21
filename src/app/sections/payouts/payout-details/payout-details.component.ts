import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
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
    shop$ = this.payout$.pipe(
        switchMap(({ party_id, shop_id }) =>
            this.partyManagementService.getShop(party_id, shop_id)
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    party$ = this.payout$.pipe(
        switchMap(({ party_id }) => this.partyManagementService.get(party_id)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    payoutTool$ = combineLatest([this.payout$, this.shop$]).pipe(
        switchMap(([{ party_id, payout_tool_id }, { contract_id }]) =>
            this.partyManagementService
                .getContract(party_id, contract_id)
                .pipe(map((contract) => contract.payout_tools.find((t) => t.id === payout_tool_id)))
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    displayedColumns = ['source', 'destination', 'volume', 'details'];

    constructor(
        private route: ActivatedRoute,
        private payoutManagementService: PayoutManagementService,
        private partyManagementService: PartyManagementService
    ) {}
}
