import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { debounceTime } from 'rxjs/operators';

import { QueryParamsService } from '@cc/app/shared/services';

import { DIALOG_CONFIG, DialogConfig } from '../../../tokens';
import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
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
export class PayoutsComponent implements OnInit {
    control = new FormControl<PayoutsSearchForm>(this.qp.params);
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<PayoutsSearchForm>,
        private dialog: MatDialog,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig
    ) {}

    ngOnInit() {
        this.control.valueChanges
            .pipe(debounceTime(250), untilDestroyed(this))
            .subscribe((value) => this.search(value));
    }

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

    create() {
        this.dialog
            .open(CreatePayoutDialogComponent, this.dialogConfig.medium)
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
