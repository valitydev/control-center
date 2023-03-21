import { Injectable } from '@angular/core';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import { map } from 'rxjs/operators';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';

import { FistfulStatisticsService, createDsl } from '../../api/fistful-stat';
import { PartialFetcher } from '../../shared/services';

@Injectable({
    providedIn: 'root',
})
export class FetchWalletsService extends PartialFetcher<StatWallet, WalletParams> {
    constructor(private fistfulStatisticsService: FistfulStatisticsService) {
        super();
    }

    protected fetch(params: WalletParams) {
        return this.fistfulStatisticsService
            .GetWallets({ dsl: createDsl({ wallets: params }) })
            .pipe(
                map((res) => ({
                    result: res.data.wallets,
                    continuationToken: res.continuation_token,
                }))
            );
    }
}
