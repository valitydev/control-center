import { Inject, Injectable } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { depositParamsToRequest, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';
import { SEARCH_LIMIT } from '@cc/app/tokens';
import { booleanDelay } from '@cc/utils/boolean-delay';

import { SearchParams } from '../../types/search-params';

@Injectable()
export class FetchDepositsService extends PartialFetcher<StatDeposit, SearchParams> {
    isLoading$ = this.doAction$.pipe(booleanDelay(), shareReplay(1));

    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        @Inject(SEARCH_LIMIT) private searchLimit: number
    ) {
        super();
    }

    fetch(params: SearchParams, continuationToken: string): Observable<FetchResult<StatDeposit>> {
        return this.fistfulStatisticsService
            .GetDeposits(
                depositParamsToRequest(
                    {
                        ...params,
                        size: this.searchLimit,
                    },
                    continuationToken
                )
            )
            .pipe(
                map((res) => ({
                    result: res.data.deposits,
                    continuationToken: res.continuation_token,
                }))
            );
    }
}
