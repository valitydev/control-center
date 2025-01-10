import { Injectable } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { FetchOptions, FetchResult, FetchSuperclass, NotifyLogService } from '@vality/matez';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { QueryDsl, createDsl } from '../../../../api/fistful-stat';
import { FistfulStatisticsService } from '../../../../api/fistful-stat/fistful-statistics.service';

@Injectable()
export class FetchDepositsService extends FetchSuperclass<
    StatDeposit,
    QueryDsl['query']['deposits']
> {
    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(
        params: QueryDsl['query']['deposits'],
        options: FetchOptions,
    ): Observable<FetchResult<StatDeposit>> {
        return this.fistfulStatisticsService
            .GetDeposits({
                dsl: createDsl({
                    deposits: {
                        ...params,
                        size: options.size,
                    },
                }),
                continuation_token: options.continuationToken,
            })
            .pipe(
                map((res) => ({
                    result: res.data.deposits,
                    continuationToken: res.continuation_token,
                })),
                catchError((err) => {
                    this.log.error(err);
                    return of({ result: [] });
                }),
            );
    }
}
