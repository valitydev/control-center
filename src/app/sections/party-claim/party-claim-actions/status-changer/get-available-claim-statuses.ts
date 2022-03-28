import { ClaimStatus as CMClaimStatus } from '@vality/domain-proto/lib/claim_management';

import { ClaimStatus } from '../../../../papi/model';
import { extractClaimStatus } from '../../../../shared/utils';

export const getAvailableClaimStatuses = (status: CMClaimStatus): ClaimStatus[] => {
    switch (extractClaimStatus(status)) {
        case ClaimStatus.Pending:
            return [
                ClaimStatus.Accepted,
                ClaimStatus.Review,
                ClaimStatus.Denied,
                ClaimStatus.Revoked,
            ];
        case ClaimStatus.Review:
            return [
                ClaimStatus.Accepted,
                ClaimStatus.Pending,
                ClaimStatus.Denied,
                ClaimStatus.Revoked,
            ];
        default:
            return [];
    }
};
