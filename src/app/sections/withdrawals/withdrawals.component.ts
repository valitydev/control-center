import { Component, OnInit, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { PartyID } from '@vality/domain-proto/domain';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import {
    QueryParamsService,
    UpdateOptions,
    clean,
    DialogService,
    DateRange,
    getNoTimeZoneIsoString,
    DialogResponseStatus,
    NumberRange,
    createDateRangeToToday,
    isEqualDateRange,
    getValueChanges,
    countChanged,
    debounceTimeWithFirst,
    Column2,
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { map, shareReplay } from 'rxjs/operators';

import { WithdrawalParams } from '@cc/app/api/fistful-stat';
import { createDomainObjectColumn, createCurrencyColumn } from '@cc/app/shared';

import { createFailureColumn } from '../../shared';
import { FailMachinesDialogComponent, Type } from '../../shared/components/fail-machines-dialog';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';

import { CreateAdjustmentDialogComponent } from './components/create-adjustment-dialog/create-adjustment-dialog.component';
import { FetchWithdrawalsService } from './services/fetch-withdrawals.service';

interface WithdrawalsForm {
    dateRange: DateRange;
    merchant: PartyID;
    status: WithdrawalParams['status'];
    amount: NumberRange;
    withdrawalIds: WithdrawalParams['withdrawal_ids'];
    walletId: WithdrawalParams['wallet_id'];
    errorMessage: WithdrawalParams['error_message'];
    providerId: WithdrawalParams['withdrawal_provider_id'];
    terminalId: WithdrawalParams['withdrawal_terminal_id'];
}

@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
    providers: [FetchWithdrawalsService],
})
export class WithdrawalsComponent implements OnInit {
    filtersForm = this.fb.group<WithdrawalsForm>({
        dateRange: createDateRangeToToday(this.dateRangeDays),
        merchant: null,
        status: null,
        amount: null,
        withdrawalIds: null,
        walletId: null,
        errorMessage: null,
        providerId: null,
        terminalId: null,
    });
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v, { dateRange: isEqualDateRange })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    withdrawals$ = this.fetchWithdrawalsService.result$;
    inProgress$ = this.fetchWithdrawalsService.isLoading$;
    hasMore$ = this.fetchWithdrawalsService.hasMore$;
    columns: Column2<StatWithdrawal>[] = [
        { field: 'id', sticky: 'start' },
        { field: 'external_id' },
        { field: 'created_at', cell: { type: 'datetime' } },
        { field: 'identity_id' },
        { field: 'source_id' },
        { field: 'destination_id' },
        createCurrencyColumn((d) => ({ amount: d.amount, code: d.currency_symbolic_code }), {
            field: 'amount',
        }),
        createCurrencyColumn((d) => ({ amount: d.fee, code: d.currency_symbolic_code }), {
            field: 'fee',
        }),
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
        createDomainObjectColumn((d) => ({ ref: { terminal: { id: d.terminal_id } } }), {
            header: 'Terminal',
        }),
        createDomainObjectColumn((d) => ({ ref: { provider: { id: d.provider_id } } }), {
            header: 'Provider',
        }),
        createFailureColumn((d) => ({ failure: d.status?.failed?.base_failure })),
    ];
    selected: StatWithdrawal[] = [];
    statuses: WithdrawalParams['status'][] = ['Pending', 'Succeeded', 'Failed'];

    private initFilters = this.filtersForm.value;

    constructor(
        private fetchWithdrawalsService: FetchWithdrawalsService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<Partial<WithdrawalsForm>>,
        private dialogService: DialogService,
        private destroyRef: DestroyRef,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(Object.assign({}, this.qp.params));
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.update());
    }

    update(options?: UpdateOptions) {
        const {
            dateRange,
            merchant,
            status,
            amount,
            withdrawalIds,
            walletId,
            errorMessage,
            providerId,
            terminalId,
        } = this.filtersForm.value;
        void this.qp.set(clean(this.filtersForm.value));
        const params = clean({
            party_id: merchant,
            from_time: dateRange?.start && getNoTimeZoneIsoString(dateRange?.start),
            to_time: dateRange?.end && getNoTimeZoneIsoString(endOfDay(dateRange?.end)),
            status: status,
            amount_from: amount?.start,
            amount_to: amount?.end,
            withdrawal_ids: withdrawalIds,
            wallet_id: walletId,
            error_message: errorMessage,
            withdrawal_terminal_id: terminalId,
            withdrawal_provider_id: providerId,
        });
        this.fetchWithdrawalsService.load(params, options);
    }

    more() {
        this.fetchWithdrawalsService.more();
    }

    reload(options: UpdateOptions) {
        this.fetchWithdrawalsService.reload(options);
    }

    adjustment() {
        this.dialogService.open(CreateAdjustmentDialogComponent, {
            withdrawals: this.selected,
        });
    }

    failMachines() {
        this.dialogService
            .open(FailMachinesDialogComponent, {
                ids: this.selected.map((s) => s.id),
                type: Type.Withdrawal,
            })
            .afterClosed()
            .subscribe((res) => {
                if (res.status === DialogResponseStatus.Success) {
                    this.fetchWithdrawalsService.reload();
                    this.selected = [];
                } else if (res.data?.errors?.length) {
                    this.selected = res.data.errors.map(({ index }) => this.selected[index]);
                }
            });
    }
}
