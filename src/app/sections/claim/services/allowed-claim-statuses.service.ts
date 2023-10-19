import { Injectable } from '@angular/core';
import { ClaimStatus } from '@vality/domain-proto/claim_management';

import { CLAIM_STATUSES } from '@cc/app/api/claim-management';
import { AppAuthGuardService, ClaimManagementRole } from '@cc/app/shared/services';

const CLAIM_STATUS_ROLES: { [N in keyof ClaimStatus]: ClaimManagementRole[] } = {
    accepted: [ClaimManagementRole.AcceptClaim],
    denied: [ClaimManagementRole.DenyClaim],
    review: [ClaimManagementRole.RequestClaimReview],
    revoked: [ClaimManagementRole.RevokeClaim],
    pending: [ClaimManagementRole.RequestClaimChanges],
};

@Injectable({
    providedIn: 'root',
})
export class AllowedClaimStatusesService {
    constructor(private appAuthGuardService: AppAuthGuardService) {}

    getAllowedStatuses(currentClaimStatus: keyof ClaimStatus) {
        return CLAIM_STATUSES.filter((status) => this.isAllowed(status, currentClaimStatus));
    }

    private isAllowed(status: keyof ClaimStatus, currentClaimStatus: keyof ClaimStatus): boolean {
        const excludedStatuses: (keyof ClaimStatus)[] = [currentClaimStatus, 'pending_acceptance'];
        const includedCurrentStatuses: (keyof ClaimStatus)[] = ['pending', 'review'];
        if (
            excludedStatuses.includes(status) ||
            !includedCurrentStatuses.includes(currentClaimStatus)
        ) {
            return false;
        }
        return this.appAuthGuardService.userHasRoles(CLAIM_STATUS_ROLES[status]);
    }
}
