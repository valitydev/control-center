import { Component, OnInit } from '@angular/core';

import { FetchPayoutsService } from './fetch-payouts.service';

@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.scss'],
    providers: [FetchPayoutsService],
})
export class PayoutsComponent implements OnInit {
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(private fetchPayoutsService: FetchPayoutsService) {}

    ngOnInit() {
        this.fetchPayoutsService.search({
            common_search_query_params: {
                from_time: new Date('01.01.2020').toISOString(),
                to_time: new Date().toISOString(),
            },
        });
    }

    fetchMore() {
        this.fetchPayoutsService.fetchMore();
    }
}
