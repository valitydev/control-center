import { Injectable } from '@angular/core';
import {
    type TerminalTermSet,
    type TerminalSearchQuery,
} from '@vality/dominator-proto/internal/dominator';
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
export class TerminalsTermsService extends FetchSuperclass<TerminalTermSet, TerminalSearchQuery> {
    constructor(
        private dominatorService: DominatorService,
        private log: NotifyLogService,
    ) {
        super();
    }

    protected fetch(params: TerminalSearchQuery, options: FetchOptions) {
        return this.dominatorService
            .SearchTerminalTermSets({
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
