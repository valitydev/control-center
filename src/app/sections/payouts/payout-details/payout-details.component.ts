import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PayoutID, PayoutStatus } from '@vality/magista-proto/magista';
import { Column, progressTo } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { FinalCashFlowPosting } from '@vality/payout-manager-proto/internal/proto/domain';
import startCase from 'lodash-es/startCase';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';
import { PayoutManagementService } from '@cc/app/api/payout-manager';

import { createCurrencyColumn } from '../../../shared';
import { PayoutActionsService } from '../services/payout-actions.service';

@Component({
    selector: 'cc-payout-details',
    templateUrl: './payout-details.component.html',
    providers: [PayoutActionsService],
})
export class PayoutDetailsComponent {
    progress$ = new BehaviorSubject(0);
    payout$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map((p) => p?.payoutId),
        switchMap((id: string) =>
            this.payoutManagementService.GetPayout(id).pipe(progressTo(this.progress$)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    shop$ = this.payout$.pipe(
        switchMap(({ party_id, shop_id }) =>
            this.partyManagementService.GetShop(party_id, shop_id),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    party$ = this.payout$.pipe(
        switchMap(({ party_id }) => this.partyManagementService.Get(party_id)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    payoutTool$ = combineLatest([this.payout$, this.shop$]).pipe(
        switchMap(([{ party_id, payout_tool_id }, { contract_id }]) =>
            this.partyManagementService
                .GetContract(party_id, contract_id)
                .pipe(
                    map((contract) => contract.payout_tools.find((t) => t.id === payout_tool_id)),
                ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    cashFlowColumns: Column<FinalCashFlowPosting>[] = [
        {
            field: 'source',
            description: (d) => getUnionValue(d.source.account_type),
            formatter: (d) => startCase(getUnionKey(d.source.account_type)),
        },
        {
            field: 'destination',
            description: (d) => getUnionValue(d.destination.account_type),
            formatter: (d) => startCase(getUnionKey(d.destination.account_type)),
        },
        createCurrencyColumn(
            'volume',
            (d) => d.volume.amount,
            (d) => d.volume.currency.symbolic_code,
        ),
        'details',
    ];

    constructor(
        private route: ActivatedRoute,
        private payoutManagementService: PayoutManagementService,
        private partyManagementService: PartyManagementService,
        private payoutActionsService: PayoutActionsService,
    ) {}

    canBeConfirmed(status: keyof PayoutStatus) {
        return this.payoutActionsService.canBeConfirmed(status);
    }

    canBeCancelled(status: keyof PayoutStatus) {
        return this.payoutActionsService.canBeCancelled(status);
    }

    cancel(id: PayoutID) {
        this.payoutActionsService.cancel(id);
    }

    confirm(id: PayoutID) {
        this.payoutActionsService.confirm(id);
    }
}
