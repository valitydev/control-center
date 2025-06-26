import { Injectable, inject } from '@angular/core';
import { StatWallet } from '@vality/fistful-proto/fistful_stat';
import { FetchOptions, FetchSuperclass } from '@vality/matez';
import { map } from 'rxjs/operators';

import { FistfulStatisticsService, createDsl } from '../../api/fistful-stat';
import { WalletParams } from '../../api/fistful-stat/query-dsl/types/wallet';

@Injectable()
export class FetchWalletsService extends FetchSuperclass<StatWallet, WalletParams> {
    private fistfulStatisticsService = inject(FistfulStatisticsService);

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
