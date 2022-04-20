import { ClaimStatus } from '@vality/domain-proto/lib/claim_management';

export const CLAIM_STATUS_ICON_NAME: Record<keyof ClaimStatus, string> = {
    pending_acceptance: 'check',
    accepted: 'check',

    pending: 'double_arrow',
    review: 'double_arrow',

    revoked: 'block',
    denied: 'block',
};
