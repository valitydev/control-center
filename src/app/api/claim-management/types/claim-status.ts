import { ClaimStatus as ClaimStatusUnion } from '@vality/domain-proto/lib/claim_management';

import { enumerate } from '@cc/utils';

export const CLAIM_STATUSES = enumerate<keyof ClaimStatusUnion>()(
    'pending',
    'review',
    'pending_acceptance',
    'accepted',
    'denied',
    'revoked'
);

/** @deprecated use CLAIM_STATUS - it checks for the occurrence of all elements */
export enum ClaimStatus {
    Pending = 'pending',
    Review = 'review',
    Denied = 'denied',
    Revoked = 'revoked',
    Accepted = 'accepted',
    PendingAcceptance = 'pending_acceptance',
}
