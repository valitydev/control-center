import { Injectable } from '@angular/core';
import { StatWithdrawal } from '@vality/fistful-proto/lib/fistful_stat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FistfulStatisticsService } from '../../../api/fistful-stat';
import { createDsl, WithdrawalParams } from '../../../query-dsl';
import { FetchResult, PartialFetcher } from '../../../shared/services';

@Injectable()
export class FetchWithdrawalsService extends PartialFetcher<StatWithdrawal, WithdrawalParams> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    fetch(
        params: WithdrawalParams,
        continuationToken: string
    ): Observable<FetchResult<StatWithdrawal>> {
        return this.fistfulStatisticsService
            .GetWithdrawals({
                dsl: createDsl({
                    withdrawals: params,
                }),
                continuation_token: continuationToken,
            })
            .pipe(
                map(({ data, continuation_token }) => ({
                    result: data.withdrawals,
                    continuationToken: continuation_token,
                }))
            );
    }
}
