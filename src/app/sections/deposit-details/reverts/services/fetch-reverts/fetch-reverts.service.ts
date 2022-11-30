import { Injectable } from '@angular/core';
import { StatDepositRevert } from '@vality/fistful-proto/lib/fistful_stat';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FistfulStatisticsService } from '@cc/app/api/deprecated-fistful';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

import { FetchRevertsParams } from '../../types/fetch-reverts-params';

@Injectable()
export class FetchRevertsService extends PartialFetcher<StatDepositRevert, FetchRevertsParams> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    fetch(
        params: FetchRevertsParams,
        continuationToken: string
    ): Observable<FetchResult<StatDepositRevert>> {
        return this.fistfulStatisticsService
            .getDepositReverts({ deposit_id: params.depositID }, continuationToken)
            .pipe(
                map((res) => ({
                    result: res.data.deposit_reverts,
                    continuationToken: res.continuation_token,
                }))
            );
    }
}
