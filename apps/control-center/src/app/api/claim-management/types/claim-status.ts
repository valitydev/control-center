import { ClaimStatus } from '@vality/domain-proto/claim_management';

import { enumerate } from '../../../../utils/enumerate';

export const CLAIM_STATUSES = enumerate<keyof ClaimStatus>()(
    'pending',
    'review',
    'pending_acceptance',
    'accepted',
    'denied',
    'revoked',
);
