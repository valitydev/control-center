import { Injectable } from '@angular/core';
import { PartyID } from '@vality/domain-proto';
import {
    Claim,
    ClaimID,
    ClaimSearchQuery,
    ClaimStatus,
} from '@vality/domain-proto/lib/claim_management';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FetchResult, PartialFetcher } from '@cc/app/shared/services';

import { ClaimManagementService } from '../../thrift-services/damsel/claim-management.service';

type SearchClaimsParams = {
    claim_id?: ClaimID;
    statuses?: (keyof ClaimStatus)[];
    party_id: PartyID;
};

@Injectable()
export class SearchClaimsService extends PartialFetcher<Claim, SearchClaimsParams> {
    claims$: Observable<Claim[]> = this.searchResult$;

    private readonly searchLimit = 10;

    constructor(private claimManagementService: ClaimManagementService) {
        super();
    }

    protected fetch(
        params: SearchClaimsParams,
        continuationToken: string
    ): Observable<FetchResult<Claim>> {
        return this.claimManagementService
            .searchClaims({
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
