import { ClaimStatus } from '@vality/domain-proto/lib/claim_management';

import { StatusColor } from './status-color';

export const CLAIM_STATUS_COLOR: Record<keyof ClaimStatus, StatusColor> = {
    pending_acceptance: StatusColor.Success,
    accepted: StatusColor.Success,

    pending: StatusColor.Warn,
    review: StatusColor.Warn,

    revoked: StatusColor.Error,
    denied: StatusColor.Error,
};
