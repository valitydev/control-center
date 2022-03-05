import { Injectable } from '@angular/core';
import { StatPayout, PayoutSearchQuery } from '@vality/magista-proto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { MerchantStatisticsService } from '@cc/app/api/magista';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

export type SearchParams = Overwrite<
    PayoutSearchQuery,
    {
        common_search_query_params: Omit<
            PayoutSearchQuery['common_search_query_params'],
            'continuation_token' | 'limit'
        >;
    }
>;

@Injectable()
export class FetchPayoutsService extends PartialFetcher<StatPayout, SearchParams> {
    constructor(private merchantStatisticsService: MerchantStatisticsService) {
        super();
    }

    protected fetch(
        params: SearchParams,
        continuationToken: string
    ): Observable<FetchResult<StatPayout>> {
        return this.merchantStatisticsService
            .searchPayouts({
                ...params,
                common_search_query_params: {
                    ...params.common_search_query_params,
                    continuation_token: continuationToken,
                },
            })
            .pipe(
                map(({ continuation_token, payouts }) => ({
                    result: payouts,
                    continuationToken: continuation_token,
                }))
            );
    }
}
