import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PayoutTool } from '@cc/app/api/damsel/gen-model/domain';
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
    party$ = this.payout$.pipe(
        switchMap(({ party_id }) => this.partyService.getParty(party_id)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    payoutTool$ = this.payout$.pipe(
        switchMap(({ payout_tool_id }) =>
            of({
                id: payout_tool_id,
                payout_tool_info: {
                    international_bank_account: {
                        bank: {},
                    },
                },
            } as PayoutTool)
        ), // TODO
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    displayedColumns = ['source', 'destination', 'volume', 'details'];

    constructor(
        private route: ActivatedRoute,
        private payoutManagementService: PayoutManagementService,
        private partyService: PartyService
    ) {}
}
