import { Injectable } from '@angular/core';
import { StatWithdrawal } from '@vality/fistful-proto/lib/fistful_stat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createDsl, WithdrawalParams, FistfulStatisticsService } from '@cc/app/api/fistful-stat';

import { FetchResult, PartialFetcher } from '../../../shared/services';
import { NotificationErrorService } from '../../../shared/services/notification-error';

@Injectable()
export class FetchWithdrawalsService extends PartialFetcher<StatWithdrawal, WithdrawalParams> {
    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private notificationErrorService: NotificationErrorService
    ) {
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

    protected handleError(error: unknown) {
        this.notificationErrorService.error(error);
    }
}
