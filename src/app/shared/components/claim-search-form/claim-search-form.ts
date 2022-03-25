import { PartyID } from '@vality/domain-proto';

import { ClaimStatus } from '../../../papi/model';
import { ClaimID } from '../../../thrift-services/damsel/gen-model/claim_management';

export interface ClaimSearchForm {
    claim_id: ClaimID;
    statuses: ClaimStatus[];
    party_id: PartyID;
}
