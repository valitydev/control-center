import { Injectable } from '@angular/core';
import { StatWallet } from '@vality/fistful-proto/fistful_stat';
import { FetchSuperclass, FetchOptions } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';

import { FistfulStatisticsService, createDsl } from '../../api/fistful-stat';

@Injectable()
export class FetchWalletsService extends FetchSuperclass<StatWallet, WalletParams> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    protected fetch(params: WalletParams, { size, continuationToken }: FetchOptions) {
        return this.fistfulStatisticsService
            .GetWallets({
                dsl: createDsl({ wallets: { size, ...params } }),
                continuation_token: continuationToken,
            })
            .pipe(
                map((res) => ({
                    result: res.data.wallets,
                    continuationToken: res.continuation_token,
                })),
            );
    }
}
