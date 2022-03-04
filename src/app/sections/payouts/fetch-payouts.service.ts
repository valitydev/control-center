import { Injectable } from '@angular/core';
import { StatPayout, PayoutSearchQuery } from '@vality/magista-proto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MerchantStatisticsService } from '@cc/app/api/magista';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

@Injectable()
export class FetchPayoutsService extends PartialFetcher<StatPayout, PayoutSearchQuery> {
    constructor(private merchantStatisticsService: MerchantStatisticsService) {
        super();
    }

    protected fetch(
        params: PayoutSearchQuery,
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
