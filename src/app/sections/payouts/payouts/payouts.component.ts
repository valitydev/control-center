import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Party, Shop, ShopID, PartyID } from '@vality/domain-proto/domain';
import { magista } from '@vality/magista-proto';
import { StatPayout } from '@vality/magista-proto/magista';
import {
    DialogService,
    QueryParamsService,
    clean,
    getValueChanges,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
    Column,
    createOperationColumn,
    DateRange,
    countProps,
    isEqualDateRange,
    UpdateOptions,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import omit from 'lodash-es/omit';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { getUnionKey } from '../../../../utils';
import { createCurrencyColumn, createPartyColumn, createShopColumn } from '../../../shared';
import { DATE_RANGE_DAYS } from '../../../tokens';
import { PayoutActionsService } from '../services/payout-actions.service';

import { CreatePayoutDialogComponent } from './components/create-payout-dialog/create-payout-dialog.component';
import { FetchPayoutsService } from './services/fetch-payouts.service';

interface PayoutsSearchForm {
    payoutId: string;
    partyId: Party['id'];
    dateRange: DateRange;
    shops: Shop['id'][];
    payoutStatusTypes: magista.PayoutStatusType[];
    payoutToolType: magista.PayoutToolType;
}

@UntilDestroy()
@Component({
    selector: 'cc-payouts',
    templateUrl: './payouts.component.html',
    providers: [FetchPayoutsService, PayoutActionsService],
})
export class PayoutsComponent implements OnInit {
    filtersForm = this.fb.group({
        payoutId: null as string,
        partyId: null as PartyID,
        dateRange: createDateRangeToToday(this.dateRangeDays),
        shops: [null as ShopID[]],
        payoutStatusTypes: [null as magista.PayoutStatusType[]],
        payoutToolType: [null as magista.PayoutToolType],
    });
    inProgress$ = this.fetchPayoutsService.isLoading$;
    payouts$ = this.fetchPayoutsService.result$;
    hasMore$ = this.fetchPayoutsService.hasMore$;
    columns: Column<StatPayout>[] = [
        { field: 'id', link: (d) => `/payouts/${d.id}` },
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
    statusTypeEnum = magista.PayoutStatusType;
    payoutToolTypeEnum = magista.PayoutToolType;
    active = 0;

    constructor(
        private fetchPayoutsService: FetchPayoutsService,
        private qp: QueryParamsService<Partial<PayoutsSearchForm>>,
        private dialogService: DialogService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        private payoutActionsService: PayoutActionsService,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(
                filter(() => this.filtersForm.valid),
                untilDestroyed(this),
            )
            .subscribe((value) => void this.qp.set(clean(value)));
        this.qp.params$.pipe(untilDestroyed(this)).subscribe(() => this.search());
    }

    more() {
        this.fetchPayoutsService.more();
    }

    search(options?: UpdateOptions) {
        const value = this.qp.params;
        if (!value.dateRange) {
            return;
        }
        this.fetchPayoutsService.load(
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
            options,
        );
        this.active =
            countProps(omit(value, 'dateRange')) +
            +!isEqualDateRange(value.dateRange, createDateRangeToToday(this.dateRangeDays));
    }

    create() {
        this.dialogService.open(CreatePayoutDialogComponent);
    }
}
