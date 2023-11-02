import { Injectable } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { FetchSuperclass, FetchResult, FetchOptions, NotifyLogService } from '@vality/ng-core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { FistfulStatisticsService, createDsl, QueryDsl } from '@cc/app/api/fistful-stat';

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
