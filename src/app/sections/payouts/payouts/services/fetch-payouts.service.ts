import { Injectable } from '@angular/core';
import { StatPayout, PayoutSearchQuery } from '@vality/magista-proto/magista';
import { FetchSuperclass, NotifyLogService, FetchResult, FetchOptions } from '@vality/ng-core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { MerchantStatisticsService } from '@cc/app/api/magista';

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
export class FetchPayoutsService extends FetchSuperclass<StatPayout, SearchParams> {
    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(
        params: SearchParams,
        options: FetchOptions,
    ): Observable<FetchResult<StatPayout>> {
        return this.merchantStatisticsService
            .SearchPayouts({
                ...params,
                common_search_query_params: {
                    ...params.common_search_query_params,
                    ...(options.continuationToken
                        ? { continuation_token: options.continuationToken }
                        : {}),
                    limit: options.size,
                },
            })
            .pipe(
                map(({ continuation_token, payouts }) => ({
                    result: payouts,
                    continuationToken: continuation_token,
                })),
                catchError((err) => {
                    this.log.error(err);
                    return of({ result: [] });
                }),
            );
    }
}
