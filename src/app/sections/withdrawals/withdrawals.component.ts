import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto/domain';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import {
    QueryParamsService,
    Column,
    UpdateOptions,
    countProps,
    clean,
    DialogService,
    DateRange,
    getNoTimeZoneIsoString,
} from '@vality/ng-core';
import { endOfDay } from 'date-fns';
import startCase from 'lodash-es/startCase';

import { WithdrawalParams } from '@cc/app/api/fistful-stat';

import { getUnionKey } from '../../../utils';
import { AmountCurrencyService } from '../../shared/services';

import { CreateAdjustmentDialogComponent } from './components/create-adjustment-dialog/create-adjustment-dialog.component';
import { FetchWithdrawalsService } from './services/fetch-withdrawals.service';

interface WithdrawalsForm {
    dateRange: DateRange;
    merchant: PartyID;
    status: WithdrawalParams['status'];
    amountFrom: WithdrawalParams['amount_from'];
    amountTo: WithdrawalParams['amount_to'];
    withdrawalIds: WithdrawalParams['withdrawal_ids'];
    walletId: WithdrawalParams['wallet_id'];
}

@UntilDestroy()
@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
    providers: [FetchWithdrawalsService],
})
export class WithdrawalsComponent implements OnInit {
    filtersForm = this.fb.group<WithdrawalsForm>({
        dateRange: null,
        merchant: null,
        status: null,
        amountFrom: null,
        amountTo: null,
        withdrawalIds: null,
        walletId: null,
        ...this.qp.params,
    });
    active = 0;
    withdrawals$ = this.fetchWithdrawalsService.result$;
    inProgress$ = this.fetchWithdrawalsService.isLoading$;
    hasMore$ = this.fetchWithdrawalsService.hasMore$;
    columns: Column<StatWithdrawal>[] = [
        { field: 'id', pinned: 'left' },
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
    ];
    selected: StatWithdrawal[] = [];
    statuses: WithdrawalParams['status'][] = ['Pending', 'Succeeded', 'Failed'];

    constructor(
        private fetchWithdrawalsService: FetchWithdrawalsService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Partial<WithdrawalsForm>>,
        private amountCurrencyService: AmountCurrencyService,
        private dialogService: DialogService,
    ) {}

    ngOnInit() {
        this.filtersForm.valueChanges
            .pipe(untilDestroyed(this))
            .subscribe((v) => void this.qp.set(clean(v)));
        this.qp.params$.pipe(untilDestroyed(this)).subscribe(() => this.update());
    }

    update(options?: UpdateOptions) {
        const { dateRange, merchant, status, amountFrom, amountTo, withdrawalIds, walletId } =
            this.qp.params;
        this.fetchWithdrawalsService.load(
            clean({
                party_id: merchant,
                from_time: dateRange?.start && getNoTimeZoneIsoString(dateRange?.start),
                to_time: dateRange?.end && getNoTimeZoneIsoString(endOfDay(dateRange?.end)),
                status: status,
                amount_from: amountFrom,
                amount_to: amountTo,
                withdrawal_ids: withdrawalIds,
                wallet_id: walletId,
            }),
            options,
        );
        this.active = countProps(clean(this.qp.params));
    }

    more() {
        this.fetchWithdrawalsService.more();
    }

    adjustment() {
        this.dialogService.open(CreateAdjustmentDialogComponent, {
            withdrawals: this.selected,
        });
    }
}
