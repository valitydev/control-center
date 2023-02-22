import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { omitBy } from '@s-libs/micro-dash';
import { PartyID } from '@vality/domain-proto/domain';
import { StatWithdrawal } from '@vality/fistful-proto/fistful_stat';
import { BaseDialogResponseStatus, BaseDialogService } from '@vality/ng-core';
import { Moment } from 'moment';
import { map } from 'rxjs/operators';

import { WithdrawalParams } from '@cc/app/api/fistful-stat';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { SELECT_COLUMN_NAME } from '../../../components/table';
import { isNilOrEmptyString } from '../../../utils';
import { QueryParamsService } from '../../shared/services';
import { NotificationService } from '../../shared/services/notification';
import { CreateAdjustmentDialogComponent } from './components/create-adjustment-dialog/create-adjustment-dialog.component';
import { FetchWithdrawalsService } from './services/fetch-withdrawals.service';

interface WithdrawalsForm {
    dateRange: DateRange<Moment>;
    merchant: PartyID;
    status: WithdrawalParams['status'];
    amountFrom: WithdrawalParams['amount_from'];
    amountTo: WithdrawalParams['amount_to'];
    withdrawalId: WithdrawalParams['withdrawal_id'];
    walletId: WithdrawalParams['wallet_id'];
}

@UntilDestroy()
@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
    styles: [
        `
            :host {
                display: block;
                padding: 24px 16px;
            }
        `,
    ],
    providers: [FetchWithdrawalsService],
})
export class WithdrawalsComponent implements OnInit {
    filters = this.fb.group<WithdrawalsForm>({
        dateRange: null,
        merchant: null,
        status: null,
        amountFrom: null,
        amountTo: null,
        withdrawalId: null,
        walletId: null,
        ...this.qp.params,
    });

    withdrawals$ = this.fetchWithdrawalsService.searchResult$;
    inProgress$ = this.fetchWithdrawalsService.doAction$;
    hasMore$ = this.fetchWithdrawalsService.hasMore$;
    displayedColumns = [
        SELECT_COLUMN_NAME,
        'id',
        'createdAt',
        'identityId',
        'sourceId',
        'destinationId',
        'externalId',
        'amount',
        'fee',
        'status',
    ];
    selection: SelectionModel<StatWithdrawal>;
    statuses: WithdrawalParams['status'][] = ['Pending', 'Succeeded', 'Failed'];

    constructor(
        private fetchWithdrawalsService: FetchWithdrawalsService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Partial<WithdrawalsForm>>,
        private baseDialogService: BaseDialogService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                map((v) => omitBy(v, isNilOrEmptyString)),
                untilDestroyed(this)
            )
            .subscribe((v) => void this.qp.set(omitBy(v, isNilOrEmptyString)));
        this.qp.params$
            .pipe(untilDestroyed(this))
            .subscribe(
                ({ dateRange, merchant, status, amountFrom, amountTo, withdrawalId, walletId }) =>
                    this.fetchWithdrawalsService.search({
                        party_id: merchant,
                        from_time: dateRange?.start?.toISOString(),
                        to_time: dateRange?.end?.toISOString(),
                        status: status,
                        amount_from: amountFrom,
                        amount_to: amountTo,
                        withdrawal_id: withdrawalId,
                        wallet_id: walletId,
                    })
            );
    }

    fetchMore() {
        this.fetchWithdrawalsService.fetchMore();
    }

    adjustment() {
        this.baseDialogService
            .open(CreateAdjustmentDialogComponent, { withdrawals: this.selection.selected })
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe({
                next: ({ status }) => {
                    if (status === BaseDialogResponseStatus.Success) {
                        this.notificationService.success();
                    }
                },
                error: this.notificationErrorService.error,
            });
    }
}
