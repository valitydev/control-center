import { Injectable, inject } from '@angular/core';
import { Claim, ClaimSearchQuery } from '@vality/domain-proto/claim_management';
import { FetchOptions, FetchResult, FetchSuperclass, NotifyLogService } from '@vality/matez';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ClaimManagementService } from '../../api/claim-management/claim-management.service';

@Injectable({ providedIn: 'root' })
export class FetchClaimsService extends FetchSuperclass<
    Claim,
    Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>
> {
    private claimManagementService = inject(ClaimManagementService);
    private log = inject(NotifyLogService);

    constructor() {
        super();
    }

    protected fetch(
        params: Omit<ClaimSearchQuery, 'continuation_token' | 'limit'>,
        { size, continuationToken }: FetchOptions,
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
                }),
            );
    }
}
