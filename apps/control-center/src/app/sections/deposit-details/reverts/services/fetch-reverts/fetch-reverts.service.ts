import { Injectable, inject } from '@angular/core';
import { StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { FetchOptions, FetchSuperclass, clean } from '@vality/matez';
import { map } from 'rxjs/operators';

import { createDsl } from '../../../../../api/fistful-stat';
import { FistfulStatisticsService } from '../../../../../api/fistful-stat/fistful-statistics.service';
import { FetchRevertsParams } from '../../types/fetch-reverts-params';

@Injectable()
export class FetchRevertsService extends FetchSuperclass<StatDepositRevert, FetchRevertsParams> {
    private fistfulStatisticsService = inject(FistfulStatisticsService);

    fetch(params: FetchRevertsParams, options: FetchOptions) {
        return this.fistfulStatisticsService
            .GetDepositReverts({
                dsl: createDsl({
                    deposit_reverts: {
                        ...clean(params),
                        size: String(options.size),
                    },
                }),
                ...(!!options.continuationToken && {
                    continuation_token: options.continuationToken,
                }),
            })
            .pipe(
                map((res) => ({
                    result: res.data.deposit_reverts,
                    continuationToken: res.continuation_token,
                })),
            );
    }
}
