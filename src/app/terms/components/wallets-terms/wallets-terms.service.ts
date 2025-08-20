import { map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { type WalletSearchQuery, type WalletTermSet } from '@vality/dominator-proto/dominator';
import { FetchOptions, FetchSuperclass, NotifyLogService, clean, handleError } from '@vality/matez';

import { ThriftDominatorService } from '~/api/services';

@Injectable({
    providedIn: 'root',
})
export class WalletsTermsService extends FetchSuperclass<WalletTermSet, WalletSearchQuery> {
    private dominatorService = inject(ThriftDominatorService);
    private log = inject(NotifyLogService);

    protected fetch(params: WalletSearchQuery, options: FetchOptions<string>) {
        return this.dominatorService
            .SearchWalletTermSets({
                ...params,
                common_search_query_params: clean({
                    continuation_token: options.continuationToken,
                    limit: options.size,
                    currencies: params?.common_search_query_params?.currencies,
                }),
            })
            .pipe(
                map(({ terms, continuation_token }) => ({
                    result: terms,
                    continuationToken: continuation_token,
                })),
                handleError(this.log.error),
            );
    }
}
