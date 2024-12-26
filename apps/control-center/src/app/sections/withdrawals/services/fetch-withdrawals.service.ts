import { Injectable } from '@angular/core';
import { StatWithdrawal, StatResponse } from '@vality/fistful-proto/fistful_stat';
import { FetchSuperclass, NotifyLogService, FetchResult, FetchOptions } from '@vality/matez';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FistfulStatisticsService } from '../../../api/fistful-stat/fistful-statistics.service';

@Injectable()
export class FetchWithdrawalsService extends FetchSuperclass<StatWithdrawal, WithdrawalParams> {
    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(
        params: WithdrawalParams,
        options: FetchOptions,
    ): Observable<FetchResult<StatWithdrawal>> {
        return this.fistfulStatisticsService
            .GetWithdrawals({
                dsl: createDsl({
                    withdrawals: { ...params, size: options.size },
                }),
                continuation_token: options.continuationToken,
            })
            .pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of<StatResponse>({ data: { withdrawals: [] } });
                }),
                map(({ data, continuation_token }) => ({
                    result: data.withdrawals,
                    continuationToken: continuation_token,
                })),
            );
    }
}
