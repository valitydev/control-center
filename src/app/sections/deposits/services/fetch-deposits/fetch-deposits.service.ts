import { Inject, Injectable } from '@angular/core';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { depositParamsToRequest, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';
import { SEARCH_LIMIT } from '@cc/app/tokens';

import { SearchParams } from '../../types/search-params';

@Injectable()
export class FetchDepositsService extends PartialFetcher<StatDeposit, SearchParams> {
    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        @Inject(SEARCH_LIMIT) private searchLimit: number,
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
                    continuationToken,
                ),
            )
            .pipe(
                map((res) => ({
                    result: res.data.deposits,
                    continuationToken: res.continuation_token,
                })),
            );
    }
}
