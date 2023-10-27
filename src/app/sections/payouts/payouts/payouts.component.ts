import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
    DialogService,
    QueryParamsService,
    clean,
    getFormValueChanges,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import { filter } from 'rxjs/operators';

import { DATE_RANGE_DAYS } from '../../../tokens';
import { PayoutActionsService } from '../services/payout-actions.service';

import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { PayoutsSearchForm } from './components/payouts-search-form/payouts-search-form.component';
import { FetchPayoutsService } from './services/fetch-payouts.service';

@UntilDestroy()
@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    providers: [FetchPayoutsService, PayoutActionsService],
})
export class PayoutsComponent implements OnInit {
    control = new FormControl<PayoutsSearchForm>({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        ...(this.qp.params as PayoutsSearchForm),
    });
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<Partial<PayoutsSearchForm>>,
        private dialogService: DialogService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
    ) {}

    ngOnInit() {
        getFormValueChanges(this.control, true)
            .pipe(
                filter(() => this.control.valid),
                untilDestroyed(this),
            )
            .subscribe((value) => void this.qp.set(clean(value)));
        this.qp.params$.pipe(untilDestroyed(this)).subscribe((value) => this.search(value));
    }

    fetchMore() {
        this.fetchPayoutsService.fetchMore();
    }

    search(value: Partial<PayoutsSearchForm>) {
        this.fetchPayoutsService.search(
            clean({
                common_search_query_params: clean({
                    from_time:
                        value.dateRange?.start && getNoTimeZoneIsoString(value.dateRange?.start),
                    to_time:
                        value.dateRange?.end &&
                        getNoTimeZoneIsoString(endOfDay(value.dateRange?.end)),
                    party_id: value.partyId,
                    shop_ids: value.shops,
                }),
                payout_id: value.payoutId,
                payout_status_types: value.payoutStatusTypes,
                payout_type: value.payoutToolType,
            }),
        );
    }

    create() {
        this.dialogService.open(CreatePayoutDialogComponent);
    }
}
