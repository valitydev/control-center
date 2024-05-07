import { Component, OnInit, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { PartyID } from '@vality/domain-proto/domain';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import {
    QueryParamsService,
    Column,
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
} from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';
import { map, shareReplay } from 'rxjs/operators';

import { WithdrawalParams } from '@cc/app/api/fistful-stat';

import { createFailureColumn } from '../../shared';
import { FailMachinesDialogComponent, Type } from '../../shared/components/fail-machines-dialog';
import { AmountCurrencyService } from '../../shared/services';
import { createProviderColumn } from '../../shared/utils/table/create-provider-column';
import { createTerminalColumn } from '../../shared/utils/table/create-terminal-column';
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
    columns: Column<StatWithdrawal>[] = [
        { field: 'id' },
        { field: 'created_at', type: 'datetime' },
        'identity_id',
        'source_id',
        'destination_id',
        'external_id',
        {
            field: 'amount',
            type: 'currency',
            formatter: (d) =>
                this.amountCurrencyService.toMajor(d.amount, d.currency_symbolic_code),
            typeParameters: {
                currencyCode: (d) => d.currency_symbolic_code,
            },
        },
        {
            field: 'fee',
            type: 'currency',
            formatter: (d) => this.amountCurrencyService.toMajor(d.fee, d.currency_symbolic_code),
            typeParameters: {
                currencyCode: (d) => d.currency_symbolic_code,
            },
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
        createTerminalColumn((d) => d.terminal_id),
        createProviderColumn((d) => d.provider_id),
        createFailureColumn<StatWithdrawal>((d) => d.status?.failed?.base_failure),
    ];
    selected: StatWithdrawal[] = [];
    statuses: WithdrawalParams['status'][] = ['Pending', 'Succeeded', 'Failed'];

    private initFilters = this.filtersForm.value;

    constructor(
        private fetchWithdrawalsService: FetchWithdrawalsService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<Partial<WithdrawalsForm>>,
        private amountCurrencyService: AmountCurrencyService,
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
