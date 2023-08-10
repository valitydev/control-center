import { Inject, Injectable } from '@angular/core';
import { StatDepositRevert } from '@vality/fistful-proto/fistful_stat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createDsl, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';
import { SMALL_SEARCH_LIMIT } from '@cc/app/tokens';
import { removeEmptyProperties } from '@cc/utils';

import { FetchRevertsParams } from '../../types/fetch-reverts-params';

@Injectable()
export class FetchRevertsService extends PartialFetcher<StatDepositRevert, FetchRevertsParams> {
    constructor(
        private fistfulStatisticsService: FistfulStatisticsService,
        @Inject(SMALL_SEARCH_LIMIT) private smallSearchLimit: number,
    ) {
        super();
    }

    fetch(
        params: FetchRevertsParams,
        continuationToken: string,
    ): Observable<FetchResult<StatDepositRevert>> {
        return this.fistfulStatisticsService
            .GetDepositReverts({
                dsl: createDsl({
                    deposit_reverts: {
                        ...removeEmptyProperties(params),
                        size: this.smallSearchLimit.toString(),
                    },
                }),
                ...(!!continuationToken && { continuation_token: continuationToken }),
            })
            .pipe(
                map((res) => ({
                    result: res.data.deposit_reverts,
                    continuationToken: res.continuation_token,
                })),
            );
    }
}
