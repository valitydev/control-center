import { Injectable, inject } from '@angular/core';
import {
    MerchantStatisticsService,
    RefundSearchQuery,
    StatRefund,
} from '@vality/magista-proto/magista';
import {
    FetchOptions,
    FetchSuperclass,
    NotifyLogService,
    cleanPrimitiveProps,
} from '@vality/matez';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeepPartial } from 'utility-types';

@Injectable()
export class FetchRefundsService extends FetchSuperclass<
    StatRefund,
    DeepPartial<RefundSearchQuery>
> {
    private merchantStatisticsService = inject(MerchantStatisticsService);
    private log = inject(NotifyLogService);

    protected fetch(params: DeepPartial<RefundSearchQuery>, options: FetchOptions) {
        return this.merchantStatisticsService
            .SearchRefunds(
                cleanPrimitiveProps({
                    ...params,
                    common_search_query_params: Object.assign(
                        {
                            continuation_token: options.continuationToken,
                            limit: options.size,
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
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'refunds');
                    return of({ result: [] });
                }),
            );
    }
}
