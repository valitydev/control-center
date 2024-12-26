import { Injectable } from '@angular/core';
import {
    type WalletSearchQuery,
    type WalletTermSet,
} from '@vality/dominator-proto/internal/dominator';
import { FetchOptions, FetchSuperclass, handleError, NotifyLogService, clean } from '@vality/matez';
import { map } from 'rxjs/operators';

import { DominatorService } from '../../../../api/dominator/dominator.service';

@Injectable({
    providedIn: 'root',
})
export class WalletsTermsService extends FetchSuperclass<WalletTermSet, WalletSearchQuery> {
    constructor(
        private dominatorService: DominatorService,
        private log: NotifyLogService,
    ) {
        super();
    }

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
