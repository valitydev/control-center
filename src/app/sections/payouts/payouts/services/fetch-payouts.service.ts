import { Injectable } from '@angular/core';
import { StatPayout, PayoutSearchQuery } from '@vality/magista-proto/magista';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import { MerchantStatisticsService } from '@cc/app/api/magista';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

import { NotificationErrorService } from '../../../../shared/services/notification-error';

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
    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private notificationErrorService: NotificationErrorService
    ) {
        super();
    }

    protected fetch(
        params: SearchParams,
        continuationToken: string
    ): Observable<FetchResult<StatPayout>> {
        return this.merchantStatisticsService
            .SearchPayouts({
                ...params,
                common_search_query_params: {
                    ...params.common_search_query_params,
                    ...(continuationToken ? { continuation_token: continuationToken } : {}),
                },
            })
            .pipe(
                map(({ continuation_token, payouts }) => ({
                    result: payouts,
                    continuationToken: continuation_token,
                }))
            );
    }

    protected handleError(error: unknown) {
        this.notificationErrorService.error(error);
    }
}
