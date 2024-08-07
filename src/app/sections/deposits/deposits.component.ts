import { ChangeDetectionStrategy, Component, OnInit, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { StatDeposit, RevertStatus } from '@vality/fistful-proto/fistful_stat';
import {
    Column,
    createOperationColumn,
    UpdateOptions,
    createDateRangeToToday,
    QueryParamsService,
    clean,
    isEqualDateRange,
    getNoTimeZoneIsoString,
    DialogService,
    DialogResponseStatus,
    debounceTimeWithFirst,
    getValueChanges,
    countChanged,
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { filter, map, shareReplay } from 'rxjs/operators';

import { QueryDsl } from '../../api/fistful-stat';
import { createCurrencyColumn } from '../../shared';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';

import { CreateDepositDialogComponent } from './components/create-deposit-dialog/create-deposit-dialog.component';
import { CreateDepositsByFileDialogComponent } from './components/create-deposits-by-file-dialog/create-deposits-by-file-dialog.component';
import { FetchDepositsService } from './services/fetch-deposits/fetch-deposits.service';

const REVERT_STATUS: { [N in RevertStatus]: string } = {
    0: 'none',
    1: 'partial',
    2: 'full',
};

@Component({
    templateUrl: 'deposits.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FetchDepositsService],
})
export class DepositsComponent implements OnInit {
    filtersForm = this.fb.group({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        amount_to: null as number,
        currency_code: null as string,
        status: '' as QueryDsl['query']['deposits']['status'],
        deposit_id: '',
        identity_id: '',
        wallet_id: null as string,
        party_id: null as string,
    });
    deposits$ = this.fetchDepositsService.result$;
    hasMore$ = this.fetchDepositsService.hasMore$;
    isLoading$ = this.fetchDepositsService.isLoading$;
    columns: Column<StatDeposit>[] = [
        {
            field: 'id',
            formatter: (d) => d.description || `#${d.id}`,
            link: (d) => `/deposits/${d.id}`,
            description: 'id',
            maxWidth: 'max(300px, 30vw)',
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
    depositStatuses: QueryDsl['query']['deposits']['status'][] = ['Pending', 'Succeeded', 'Failed'];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v, { dateRange: isEqualDateRange })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFilters = this.filtersForm.value;

    constructor(
        private dialog: DialogService,
        private fetchDepositsService: FetchDepositsService,
        private router: Router,
        private fb: NonNullableFormBuilder,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private qp: QueryParamsService<object>,
        private dr: DestroyRef,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.update();
            });
    }

    createDeposit() {
        this.dialog
            .open(CreateDepositDialogComponent)
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.dr),
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
    }

    reload(options?: UpdateOptions) {
        this.fetchDepositsService.reload(options);
    }

    more() {
        this.fetchDepositsService.more();
    }

    createByFile() {
        this.dialog
            .open(CreateDepositsByFileDialogComponent)
            .afterClosed()
            .pipe(
                filter((res) => res.status === DialogResponseStatus.Success),
                takeUntilDestroyed(this.dr),
            )
            .subscribe(() => {
                this.filtersForm.reset({
                    dateRange: createDateRangeToToday(this.dateRangeDays),
                });
            });
    }
}
