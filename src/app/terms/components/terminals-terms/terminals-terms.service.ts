import { map } from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';

import {
    DominatorService,
    type TerminalSearchQuery,
    type TerminalTermSet,
} from '@vality/dominator-proto/dominator';
import { FetchOptions, FetchSuperclass, NotifyLogService, clean, handleError } from '@vality/matez';

@Injectable({
    providedIn: 'root',
})
export class TerminalsTermsService extends FetchSuperclass<TerminalTermSet, TerminalSearchQuery> {
    private dominatorService = inject(DominatorService);
    private log = inject(NotifyLogService);

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
