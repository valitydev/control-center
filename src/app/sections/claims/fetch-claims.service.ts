import { Injectable } from '@angular/core';
import { Claim, ClaimSearchQuery } from '@vality/domain-proto/claim_management';
import { FetchSuperclass, FetchResult, FetchOptions, NotifyLogService } from '@vality/ng-core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ClaimManagementService } from '@cc/app/api/claim-management';

@Injectable({ providedIn: 'root' })
export class FetchClaimsService extends FetchSuperclass<
    Claim,
    Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>
> {
    constructor(
        private claimManagementService: ClaimManagementService,
        private log: NotifyLogService
    ) {
        super();
    }

    protected fetch(
        params: Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>,
        { size, continuationToken }: FetchOptions
    ): Observable<FetchResult<Claim>> {
        return this.claimManagementService
            .SearchClaims({
                ...params,
                continuation_token: continuationToken,
                limit: size,
            })
            .pipe(
                map((r) => ({
                    result: r.result,
                    continuationToken: r.continuation_token,
                })),
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'claims');
                    return of({ result: [] });
                })
            );
    }
}
