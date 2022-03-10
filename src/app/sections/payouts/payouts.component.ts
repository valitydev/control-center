import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';

import { QueryParamsService } from '@cc/app/shared/services';

import { PayoutsSearchForm } from './components/payouts-search-form/payouts-search-form.component';
import { FetchPayoutsService, SearchParams } from './services/fetch-payouts.service';

@UntilDestroy()
@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.scss'],
    providers: [FetchPayoutsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayoutsComponent {
    control = new FormControl<PayoutsSearchForm>(this.qp.params);
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<PayoutsSearchForm>
    ) {}

    fetchMore() {
        this.fetchPayoutsService.fetchMore();
    }

    search(value: PayoutsSearchForm) {
        void this.qp.set(value);
        this.fetchPayoutsService.search(
            omitBy(
                {
                    common_search_query_params: omitBy(
                        {
                            from_time: value.fromTime?.utc()?.format(),
                            to_time: value.toTime?.utc()?.format(),
                            party_id: value.partyId,
                            shop_ids: value.shops,
                        },
                        isNil
                    ),
                    payout_id: value.payoutId,
                    // TODO: Should be enum
                    payout_statuses: value.payoutStatuses?.map((key) => ({ [key]: {} })),
                    payout_type: value.payoutType,
                },
                isNil
            ) as SearchParams
        );
    }
}
