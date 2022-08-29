import { Injectable } from '@angular/core';
import { Claim, ClaimSearchQuery } from '@vality/domain-proto/lib/claim_management';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';
import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

@Injectable()
export class SearchClaimsService extends PartialFetcher<
    Claim,
    Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>
> {
    private readonly searchLimit = 10;

    constructor(private claimManagementService: ClaimManagementService) {
        super();
    }

    protected fetch(
        params: Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>,
        continuationToken: string
    ): Observable<FetchResult<Claim>> {
        return this.claimManagementService
            .SearchClaims({
                ...params,
                continuation_token: continuationToken,
                limit: this.searchLimit,
            } as ClaimSearchQuery)
            .pipe(
                map((r) => ({
                    result: r.result,
                    continuationToken: r.continuation_token,
                }))
            );
    }
}
