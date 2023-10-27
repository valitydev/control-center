import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatPayout } from '@vality/magista-proto/magista';
import {
    DialogService,
    QueryParamsService,
    clean,
    getFormValueChanges,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
    Column,
    createOperationColumn,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { getUnionKey } from '../../../../utils';
import { createCurrencyColumn, createPartyColumn, createShopColumn } from '../../../shared';
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
    columns: Column<StatPayout>[] = [
        { field: 'id', pinned: 'left', link: (d) => `/payouts/${d.id}` },
        createPartyColumn('party_id'),
        createShopColumn('shop_id', (d) => d.party_id),
        { field: 'created_at', type: 'datetime' },
        {
            field: 'status',
            type: 'tag',
            formatter: (d) => getUnionKey(d.status),
            typeParameters: {
                label: (d) => startCase(getUnionKey(d.status)),
                tags: {
                    unpaid: { color: 'pending' },
                    paid: { color: 'success' },
                    cancelled: { color: 'warn' },
                    confirmed: { color: 'success' },
                },
            },
        },
        createCurrencyColumn(
            'amount',
            (d) => d.amount,
            (d) => d.currency_symbolic_code,
        ),
        createCurrencyColumn(
            'fee',
            (d) => d.fee,
            (d) => d.currency_symbolic_code,
        ),
        { field: 'payoutToolType', formatter: (d) => getUnionKey(d.payout_tool_info) },
        createOperationColumn([
            {
                label: 'Cancel',
                disabled: (d) => !this.payoutActionsService.canBeCancelled(getUnionKey(d.status)),
                click: (d) => this.payoutActionsService.cancel(d.id),
            },
            {
                label: 'Confirm',
                disabled: (d) => !this.payoutActionsService.canBeConfirmed(getUnionKey(d.status)),
                click: (d) => this.payoutActionsService.confirm(d.id),
            },
        ]),
    ];

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<Partial<PayoutsSearchForm>>,
        private dialogService: DialogService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        private payoutActionsService: PayoutActionsService,
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
