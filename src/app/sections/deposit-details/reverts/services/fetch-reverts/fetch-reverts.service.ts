import { Injectable } from '@angular/core';
import { StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { FetchSuperclass, FetchOptions } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { createDsl, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { removeEmptyProperties } from '@cc/utils';

import { FetchRevertsParams } from '../../types/fetch-reverts-params';

@Injectable()
export class FetchRevertsService extends FetchSuperclass<StatDepositRevert, FetchRevertsParams> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    fetch(params: FetchRevertsParams, options: FetchOptions) {
        return this.fistfulStatisticsService
            .GetDepositReverts({
                dsl: createDsl({
                    deposit_reverts: {
                        ...removeEmptyProperties(params),
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
