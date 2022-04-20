import { Component, Input } from '@angular/core';
import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import isEmpty from 'lodash-es/isEmpty';

import { getUnionKey } from '@cc/utils/get-union-key';

@Component({
    selector: 'cc-modification-unit-timeline-item',
    templateUrl: './modification-unit-timeline-item.component.html',
})
export class ModificationUnitTimelineItemComponent {
    @Input() modificationUnit: ModificationUnit;

    get name() {
        return getUnionKey(this.modificationUnit.modification);
    }

    get group() {
        return getUnionKey(this.modificationUnit.modification[this.name]);
    }

    get type() {
        return getUnionKey(
            (this.modificationUnit.modification[this.name][this.group] as any).modification
        );
    }

    get internalModification() {
        return (this.modificationUnit.modification[this.name][this.group] as any).modification[
            this.type
        ];
    }

    get hasModificationContent() {
        return !isEmpty(this.internalModification);
    }
}
