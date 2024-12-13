import { Injectable } from '@angular/core';
import { StatChargeback, ChargebackSearchQuery } from '@vality/magista-proto/magista';
import { FetchSuperclass, FetchOptions, NotifyLogService } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MerchantStatisticsService } from '../../api/magista';

@Injectable()
export class FetchChargebacksService extends FetchSuperclass<
    StatChargeback,
    ChargebackSearchQuery
> {
    constructor(
        private merchantStatisticsService: MerchantStatisticsService,
        private log: NotifyLogService,
    ) {
        super();
    }

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
