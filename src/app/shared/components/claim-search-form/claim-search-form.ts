import { PartyID } from '@vality/domain-proto';
import { ClaimID, ClaimStatus } from '@vality/domain-proto/lib/claim_management';

export interface ClaimSearchForm {
    claim_id: ClaimID;
    statuses: (keyof ClaimStatus)[];
    party_id: PartyID;
}
