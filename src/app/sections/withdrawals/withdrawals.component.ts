import { Component, OnInit } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto';
import { Moment } from 'moment';

import { SELECT_COLUMN_NAME } from '../../../components/table';
import { QueryParamsService } from '../../shared/services';
import { FetchWithdrawalsService } from './services/fetch-withdrawals.service';

interface WithdrawalsForm {
    dateRange: DateRange<Moment>;
    merchant: PartyID;
}

@UntilDestroy()
@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
    providers: [FetchWithdrawalsService],
})
export class WithdrawalsComponent implements OnInit {
    filters = this.fb.group<WithdrawalsForm>({
        dateRange: null,
        merchant: null,
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

    constructor(
        private fetchWithdrawalsService: FetchWithdrawalsService,
        private fb: FormBuilder,
        private qp: QueryParamsService<WithdrawalsForm>
    ) {}

    ngOnInit() {
        this.filters.valueChanges.pipe(untilDestroyed(this)).subscribe((v) => this.qp.set(v));
        this.qp.params$.pipe(untilDestroyed(this)).subscribe(({ dateRange, merchant }) =>
            this.fetchWithdrawalsService.search({
                party_id: merchant,
                from_time: dateRange?.start?.toISOString(),
                to_time: dateRange?.end?.toISOString(),
            })
        );
    }

    fetchMore() {
        this.fetchWithdrawalsService.fetchMore();
    }
}
