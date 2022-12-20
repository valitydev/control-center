import { ClaimID, ClaimStatus } from '@vality/domain-proto/claim_management';
import { PartyID } from '@vality/domain-proto/domain';

export interface ClaimSearchForm {
    claim_id: ClaimID;
    statuses: (keyof ClaimStatus)[];
    party_id: PartyID;
}
