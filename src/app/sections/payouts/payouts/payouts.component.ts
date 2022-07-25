import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import omitBy from 'lodash-es/omitBy';

import { QueryParamsService } from '@cc/app/shared/services';
import { isNilOrEmptyString } from '@cc/utils/is-nil-or-empty-string';

import { BaseDialogService } from '../../../../components/base-dialog/services/base-dialog.service';
import { DIALOG_CONFIG, DialogConfig } from '../../../tokens';
import { PayoutActionsService } from '../services/payout-actions.service';
import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { PayoutsSearchForm } from './components/payouts-search-form/payouts-search-form.component';
import { FetchPayoutsService, SearchParams } from './services/fetch-payouts.service';

@UntilDestroy()
@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.scss'],
    providers: [FetchPayoutsService, PayoutActionsService],
})
export class PayoutsComponent implements OnInit {
    control = new FormControl<PayoutsSearchForm>(this.qp.params as PayoutsSearchForm);
    inProgress$ = this.fetchPayoutsService.doAction$;
    payouts$ = this.fetchPayoutsService.searchResult$;
    hasMore$ = this.fetchPayoutsService.hasMore$;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<Partial<PayoutsSearchForm>>,
        private baseDialogService: BaseDialogService,
        @Inject(DIALOG_CONFIG) private dialogConfig: DialogConfig
    ) {}

    ngOnInit() {
        this.control.valueChanges
            .pipe(untilDestroyed(this))
            .subscribe((value) => void this.qp.set(omitBy(value, isNilOrEmptyString)));
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
                            from_time: value.fromTime?.utc()?.format(),
                            to_time: value.toTime?.utc()?.format(),
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
        this.baseDialogService.open(CreatePayoutDialogComponent);
    }
}
