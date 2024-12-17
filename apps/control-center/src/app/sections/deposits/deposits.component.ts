import { ChangeDetectionStrategy, Component, OnInit, Inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { fistful_stat } from '@vality/fistful-proto';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import {
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
    Column,
    getEnumKey,
    createMenuColumn,
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { filter, map, shareReplay } from 'rxjs/operators';

import { createCurrencyColumn } from '@cc/app/shared';

import { QueryDsl } from '../../api/fistful-stat';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';

import { CreateDepositDialogComponent } from './components/create-deposit-dialog/create-deposit-dialog.component';
import { CreateDepositsByFileDialogComponent } from './components/create-deposits-by-file-dialog/create-deposits-by-file-dialog.component';
import { FetchDepositsService } from './services/fetch-deposits/fetch-deposits.service';

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
            cell: (d) => ({
                value: d.description || `#${d.id}`,
                link: () => `/deposits/${d.id}`,
                description: d.id,
            }),
        },
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.status)),
                color: (
                    {
                        pending: 'pending',
                        succeeded: 'success',
                        failed: 'warn',
                    } as const
                )[getUnionKey(d.status)],
            }),
        },
        {
            field: 'created_at',
            cell: { type: 'datetime' },
        },
        {
            field: 'destination_id',
        },
        {
            field: 'identity_id',
        },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_symbolic_code }), {
            header: 'Amount',
        }),
        createCurrencyColumn((d) => ({ amount: d.fee, code: d.currency_symbolic_code }), {
            header: 'Fee',
        }),
        {
            field: 'revert_status',
            cell: (d) => ({
                value: startCase(getEnumKey(fistful_stat.RevertStatus, d.revert_status)),
                color: (
                    {
                        none: 'neutral',
                        partial: 'pending',
                        full: 'success',
                    } as const
                )[getEnumKey(fistful_stat.RevertStatus, d.revert_status)],
            }),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.router.navigate([`/deposits/${d.id}`]),
                },
            ],
        })),
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