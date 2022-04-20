import { Component, Input } from '@angular/core';
import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';

import { CLAIM_STATUS_COLOR } from '../../types/claim-status-color';
import { CLAIM_STATUS_ICON_NAME } from '../../types/claim-status-icon-name';

@Component({
    selector: 'cc-status-modification-timeline-item',
    templateUrl: './status-modification-timeline-item.component.html',
})
export class StatusModificationTimelineItemComponent {
    @Input() modificationUnit: ModificationUnit;

    get statusModification() {
        return this.modificationUnit.modification.claim_modification.status_modification;
    }

    claimStatusColor = CLAIM_STATUS_COLOR;
    claimStatusIconName = CLAIM_STATUS_ICON_NAME;
}
