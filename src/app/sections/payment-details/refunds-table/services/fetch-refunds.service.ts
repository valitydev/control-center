import { Injectable } from '@angular/core';
import { StatRefund, RefundSearchQuery } from '@vality/magista-proto/magista';
import { cleanPrimitiveProps } from '@vality/ng-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeepPartial } from 'utility-types';

import { MerchantStatisticsService } from '../../../../api/magista';
import { FetchResult, PartialFetcher } from '../../../../shared/services';

const SEARCH_LIMIT = 5;

@Injectable()
export class FetchRefundsService extends PartialFetcher<
    StatRefund,
    DeepPartial<RefundSearchQuery>
> {
    constructor(private merchantStatisticsService: MerchantStatisticsService) {
        super();
    }

    protected fetch(
        params: DeepPartial<RefundSearchQuery>,
        continuationToken: string,
    ): Observable<FetchResult<StatRefund>> {
        return this.merchantStatisticsService
            .SearchRefunds(
                cleanPrimitiveProps({
                    ...params,
                    common_search_query_params: Object.assign(
                        {
                            continuation_token: continuationToken,
                            limit: SEARCH_LIMIT,
                            from_time: new Date(0).toISOString(), // TODO
                            to_time: new Date().toISOString(),
                        },
                        params.common_search_query_params,
                    ),
                }),
            )
            .pipe(
                map(({ refunds, continuation_token }) => ({
                    result: refunds,
                    continuationToken: continuation_token,
                })),
            );
    }
}
