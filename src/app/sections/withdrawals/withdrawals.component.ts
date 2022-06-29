import { Component } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { FormBuilder } from '@ngneat/reactive-forms';
import { PartyID } from '@vality/domain-proto';
import { Moment } from 'moment';
import { switchMap } from 'rxjs';
import { pluck, startWith } from 'rxjs/operators';

import { FistfulStatisticsService } from '../../api/fistful-stat';
import { createDsl } from '../../query-dsl';
import { QueryParamsService } from '../../shared/services';

interface WithdrawalsForm {
    dateRange: DateRange<Moment>;
    merchant: PartyID;
}

@Component({
    selector: 'cc-withdrawals',
    templateUrl: './withdrawals.component.html',
})
export class WithdrawalsComponent {
    filters = this.fb.group<WithdrawalsForm>({
        dateRange: null,
        merchant: null,
        ...this.qp.params,
    });

    withdrawals$ = this.filters.valueChanges.pipe(
        startWith(this.filters.value),
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
        pluck('data', 'withdrawals')
    );
    inProgress$;
    hasMore$;
    displayedColumns = ['id'];

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private fb: FormBuilder,
        private qp: QueryParamsService<WithdrawalsForm>
    ) {}

    fetchMore() {}
}
