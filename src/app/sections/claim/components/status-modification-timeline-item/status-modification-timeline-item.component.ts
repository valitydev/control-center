import { Component, Input } from '@angular/core';
import { Claim, ClaimStatus, ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { getUnionKey, getUnionValue } from '@cc/utils';

import { CLAIM_STATUS_COLOR } from '../../types/claim-status-color';

@Component({
    selector: 'cc-status-modification-timeline-item',
    templateUrl: './status-modification-timeline-item.component.html',
})
export class StatusModificationTimelineItemComponent {
    @Input() modificationUnit: ModificationUnit;
    @Input() claim: Claim;

    get statusModification() {
        return this.modificationUnit.modification.claim_modification.status_modification;
    }

    get status() {
        return getUnionKey(this.statusModification.status);
    }

    get reason() {
        const statusValue = getUnionValue(this.statusModification.status);
        return 'reason' in statusValue ? statusValue.reason : null;
    }

    claimStatusColor = CLAIM_STATUS_COLOR;
    claimStatusIconName: Record<keyof ClaimStatus, string> = {
        pending_acceptance: 'check',
        accepted: 'check',
        pending: 'double_arrow',
        review: 'double_arrow',
        revoked: 'block',
        denied: 'block',
    };
}
