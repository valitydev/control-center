import { Injectable, inject } from '@angular/core';
import {
    FistfulStatistics,
    StatResponse,
    StatWithdrawal,
} from '@vality/fistful-proto/fistful_stat';
import { FetchOptions, FetchResult, FetchSuperclass, NotifyLogService } from '@vality/matez';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { WithdrawalParams, createDsl } from '../../../../api/fistful-stat';

@Injectable()
export class FetchWithdrawalsService extends FetchSuperclass<StatWithdrawal, WithdrawalParams> {
    private fistfulStatisticsService = inject(FistfulStatistics);
    private log = inject(NotifyLogService);

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
