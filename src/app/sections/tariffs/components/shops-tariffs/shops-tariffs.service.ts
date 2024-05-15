import { Injectable } from '@angular/core';
import { ShopSearchQuery, ShopTermSet } from '@vality/dominator-proto/internal/dominator';
import {
    FetchOptions,
    FetchSuperclass,
    handleError,
    NotifyLogService,
    clean,
} from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { DominatorService } from '@cc/app/api/dominator';

@Injectable({
    providedIn: 'root',
})
export class ShopsTariffsService extends FetchSuperclass<ShopTermSet, ShopSearchQuery> {
    constructor(
        private dominatorService: DominatorService,
        private log: NotifyLogService,
    ) {
        super();
    }

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
                    continuation_token,
                })),
                handleError(this.log.error),
            );
    }
}
