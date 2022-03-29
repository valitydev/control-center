import { PartyID } from '@vality/domain-proto';
import { ClaimID } from '@vality/domain-proto/lib/claim_management';

import { ClaimStatus } from '@cc/app/api/claim-management';

export interface ClaimSearchForm {
    claim_id: ClaimID;
    statuses: ClaimStatus[];
    party_id: PartyID;
}
