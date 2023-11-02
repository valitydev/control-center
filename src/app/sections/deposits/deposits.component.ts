import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatDeposit, RevertStatus } from '@vality/fistful-proto/fistful_stat';
import {
    Column,
    createOperationColumn,
    UpdateOptions,
    createDateRangeToToday,
    QueryParamsService,
    clean,
    countProps,
    isEqualDateRange,
    getNoTimeZoneIsoString,
    Option,
    compareDifferentTypes,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { filter, startWith, map, debounceTime } from 'rxjs/operators';

import { getUnionKey } from '../../../utils';
import { QueryDsl } from '../../api/fistful-stat';
import { createCurrencyColumn } from '../../shared';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';
import { FetchSourcesService } from '../sources';

import { CreateDepositDialogComponent } from './create-deposit-dialog/create-deposit-dialog.component';
import { FetchDepositsService } from './services/fetch-deposits/fetch-deposits.service';

const REVERT_STATUS: { [N in RevertStatus]: string } = {
    0: 'none',
    1: 'partial',
    2: 'full',
};

@UntilDestroy()
@Component({
    templateUrl: 'deposits.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchDepositsService],
})
export class DepositsComponent implements OnInit {
    filtersForm = this.fb.nonNullable.group({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        amount_to: null as number,
        currency_code: '',
        status: '' as QueryDsl['query']['deposits']['status'],
        deposit_id: '',
        identity_id: '',
        wallet_id: '',
        party_id: null as string,
    });
    active = 0;

    deposits$ = this.fetchDepositsService.result$;
    hasMore$ = this.fetchDepositsService.hasMore$;
    isLoading$ = this.fetchDepositsService.isLoading$;
    columns: Column<StatDeposit>[] = [
        {
            field: 'id',
            link: (d) => `/deposits/${d.id}`,
            pinned: 'left',
        },
        {
            field: 'status',
            type: 'tag',
            formatter: (d) => getUnionKey(d.status),
            typeParameters: {
                label: (d) => startCase(getUnionKey(d.status)),
                tags: {
                    pending: { color: 'pending' },
                    succeeded: { color: 'success' },
                    failed: { color: 'warn' },
                },
            },
        },
        {
            field: 'created_at',
            type: 'datetime',
        },
        {
            field: 'destination_id',
        },
        {
            field: 'identity_id',
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
            { hide: true },
        ),
        {
            field: 'source_id',
            hide: true,
        },
        {
            field: 'revert_status',
            type: 'tag',
            formatter: (d) => REVERT_STATUS[d.revert_status],
            typeParameters: {
                label: (d) => startCase(REVERT_STATUS[d.revert_status]),
                tags: {},
            },
        },
        createOperationColumn([
            {
                label: 'Details',
                click: (d) => this.router.navigate([`/deposits/${d.id}`]),
            },
        ]),
    ];
    currencyOptions$ = this.fetchSourcesService.sources$.pipe(
        map((sources): Option<string>[] =>
            sources
                .map((s) => ({
                    label: s.currency_symbolic_code,
                    value: s.currency_symbolic_code,
                    description: s.name,
                }))
                .sort((a, b) => compareDifferentTypes(a.label, b.label)),
        ),
    );
    depositStatuses: QueryDsl['query']['deposits']['status'][] = ['Pending', 'Succeeded', 'Failed'];

    constructor(
        private dialog: MatDialog,
        private fetchDepositsService: FetchDepositsService,
        private router: Router,
        private fb: FormBuilder,
        private fetchSourcesService: FetchSourcesService,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private qp: QueryParamsService<object>,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        this.filtersForm.valueChanges
            .pipe(
                startWith(this.filtersForm.value),
                debounceTime(this.debounceTimeMs),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.update();
            });
    }

    createDeposit() {
        this.dialog
            .open(CreateDepositDialogComponent, { width: '552px', disableClose: true })
            .afterClosed()
            .pipe(
                filter((deposit) => !!deposit),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.update();
            });
    }

    update(options?: UpdateOptions) {
        const { dateRange, ...filters } = clean(this.filtersForm.value);
        this.fetchDepositsService.load(
            {
                ...filters,
                from_time: getNoTimeZoneIsoString(dateRange.start),
                to_time: getNoTimeZoneIsoString(endOfDay(dateRange.end)),
            },
            options,
        );
        void this.qp.set({ dateRange, ...filters });
        this.active =
            countProps(filters) +
            +!isEqualDateRange(dateRange, createDateRangeToToday(this.dateRangeDays));
    }

    more() {
        this.fetchDepositsService.more();
    }
}
