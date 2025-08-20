import { map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import { ShopSearchQuery, ShopTermSet } from '@vality/dominator-proto/dominator';
import { FetchOptions, FetchSuperclass, NotifyLogService, clean, handleError } from '@vality/matez';

import { ThriftDominatorService } from '~/api/services';

@Injectable({
    providedIn: 'root',
})
export class ShopsTermsService extends FetchSuperclass<ShopTermSet, ShopSearchQuery> {
    private dominatorService = inject(ThriftDominatorService);
    private log = inject(NotifyLogService);

    protected fetch(params: ShopSearchQuery, options: FetchOptions<string>) {
        return this.dominatorService
            .SearchShopTermSets({
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
