import { ClaimStatus } from '@vality/domain-proto/claim_management';

import { StatusColor } from '@cc/app/styles';

export const CLAIM_STATUS_COLOR: Record<keyof ClaimStatus, StatusColor> = {
    pending_acceptance: null,
    accepted: StatusColor.Success,
    pending: StatusColor.Pending,
    review: StatusColor.Pending,
    revoked: StatusColor.Warn,
    denied: StatusColor.Warn,
};
