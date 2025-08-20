import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { ChargebackSearchQuery, StatChargeback } from '@vality/magista-proto/magista';
import { FetchOptions, FetchSuperclass, NotifyLogService } from '@vality/matez';

import { ThriftMerchantStatisticsService } from '~/api/services';

@Injectable()
export class FetchChargebacksService extends FetchSuperclass<
    StatChargeback,
    ChargebackSearchQuery
> {
    private merchantStatisticsService = inject(ThriftMerchantStatisticsService);
    private log = inject(NotifyLogService);

    protected fetch(params: ChargebackSearchQuery, options: FetchOptions) {
        return this.merchantStatisticsService
            .SearchChargebacks({
                ...params,
                common_search_query_params: {
                    continuation_token: options.continuationToken,
                    limit: options.size,
                    ...params.common_search_query_params,
                },
            })
            .pipe(
                map((res) => ({
                    result: res.chargebacks,
                    continuationToken: res.continuation_token,
                })),
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'chargebacks');
                    return of({ result: [] });
                }),
            );
    }
}
