import { Component } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';

import { PayoutsSearchForm } from './components/payouts-search-form/payouts-search-form.component';
import { FetchPayoutsService, SearchParams } from './services/fetch-payouts.service';

@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.scss'],
    providers: [FetchPayoutsService],
})
export class PayoutsComponent {
    control = new FormControl<PayoutsSearchForm>();
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(private fetchPayoutsService: FetchPayoutsService) {}

    fetchMore() {
        this.fetchPayoutsService.fetchMore();
    }

    search(value: PayoutsSearchForm) {
        this.fetchPayoutsService.search(
            omitBy(
                {
                    common_search_query_params: omitBy(
                        {
                            from_time: value.fromTime.utc().format(),
                            to_time: value.toTime.utc().format(),
                            party_id: value.merchant?.id,
                            shop_ids: value.shops?.map((shop) => shop.id),
                        },
                        isNil
                    ),
                    payout_id: value.payoutId,
                    payout_statuses: value.payoutStatuses,
                    payout_type: value.payoutType,
                },
                isNil
            ) as SearchParams
        );
    }
}
