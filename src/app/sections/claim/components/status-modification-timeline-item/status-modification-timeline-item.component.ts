import { Component, Input } from '@angular/core';
import { ClaimStatus, ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { getUnionKey } from '@cc/utils';

import { CLAIM_STATUS_COLOR } from '../../types/claim-status-color';

@Component({
    selector: 'cc-status-modification-timeline-item',
    templateUrl: './status-modification-timeline-item.component.html',
})
export class StatusModificationTimelineItemComponent {
    @Input() modificationUnit: ModificationUnit;

    get statusModification() {
        return this.modificationUnit.modification.claim_modification.status_modification;
    }

    get status() {
        return getUnionKey(this.statusModification.status);
    }

    get reason() {
        return (this.statusModification.status[this.status] as Record<'reason', string | undefined>)
            ?.reason;
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
