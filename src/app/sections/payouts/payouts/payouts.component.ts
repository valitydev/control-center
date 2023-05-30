import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DialogService } from '@vality/ng-core';
import omitBy from 'lodash-es/omitBy';
import * as moment from 'moment/moment';

import { QueryParamsService } from '@cc/app/shared/services';
import { isNilOrEmptyString } from '@cc/utils/is-nil-or-empty-string';

import { getValidValueChanges } from '../../../../utils';
import { PayoutActionsService } from '../services/payout-actions.service';
import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { PayoutsSearchForm } from './components/payouts-search-form/payouts-search-form.component';
import { FetchPayoutsService, SearchParams } from './services/fetch-payouts.service';

@UntilDestroy()
@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    providers: [FetchPayoutsService, PayoutActionsService],
})
export class PayoutsComponent implements OnInit {
    control = new FormControl<PayoutsSearchForm>({
        dateRange: { start: moment().subtract(1, 'year').startOf('d'), end: moment().endOf('d') },
        ...(this.qp.params as PayoutsSearchForm),
    });
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<Partial<PayoutsSearchForm>>,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        getValidValueChanges(this.control)
            .pipe(untilDestroyed(this))
            .subscribe((value) => void this.qp.set(value));
        this.qp.params$.pipe(untilDestroyed(this)).subscribe((value) => this.search(value));
    }

    fetchMore() {
        this.fetchPayoutsService.fetchMore();
    }

    search(value: Partial<PayoutsSearchForm>) {
        this.fetchPayoutsService.search(
            omitBy(
                {
                    common_search_query_params: omitBy(
                        {
                            from_time: value.dateRange?.start?.utc()?.format(),
                            to_time: value.dateRange?.end?.utc()?.format(),
                            party_id: value.partyId,
                            shop_ids: value.shops,
                        },
                        isNilOrEmptyString
                    ),
                    payout_id: value.payoutId,
                    payout_status_types: value.payoutStatusTypes,
                    payout_type: value.payoutToolType,
                },
                isNilOrEmptyString
            ) as SearchParams
        );
    }

    create() {
        this.dialogService.open(CreatePayoutDialogComponent);
    }
}
