import { Component, OnInit } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PartyID } from '@vality/domain-proto';
import { Moment } from 'moment';
import { switchMap } from 'rxjs';
import { pluck, shareReplay } from 'rxjs/operators';

import { SELECT_COLUMN_NAME } from '../../../components/table/select-column/select-column.component';
import { FistfulStatisticsService } from '../../api/fistful-stat';
import { createDsl } from '../../query-dsl';
import { QueryParamsService } from '../../shared/services';

interface WithdrawalsForm {
    dateRange: DateRange<Moment>;
    merchant: PartyID;
}

@UntilDestroy()
@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
})
export class WithdrawalsComponent implements OnInit {
    filters = this.fb.group<WithdrawalsForm>({
        dateRange: null,
        merchant: null,
        ...this.qp.params,
    });

    withdrawals$ = this.qp.params$.pipe(
        switchMap(({ dateRange, merchant }) =>
            this.fistfulStatisticsService.GetWithdrawals({
                dsl: createDsl({
                    withdrawals: {
                        party_id: merchant,
                        from_time: dateRange?.start?.toISOString(),
                        to_time: dateRange?.end?.toISOString(),
                    },
                }),
            })
        ),
        pluck('data', 'withdrawals'),
        untilDestroyed(this),
        shareReplay(1)
    );
    inProgress$;
    hasMore$;
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
        private fistfulStatisticsService: FistfulStatisticsService,
        private fb: FormBuilder,
        private qp: QueryParamsService<WithdrawalsForm>
    ) {}

    ngOnInit() {
        this.filters.valueChanges.pipe(untilDestroyed(this)).subscribe((v) => this.qp.set(v));
    }

    fetchMore() {}
}
