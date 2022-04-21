import { Component, Input } from '@angular/core';
import { ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { coerceBoolean } from 'coerce-property';
import isEmpty from 'lodash-es/isEmpty';

import { getModificationNameParts } from '@cc/app/sections/claim/components/modification-unit-timeline-item/utils/get-modification-name';
import { Patch } from '@cc/app/shared/components/json-viewer/json-viewer.component';
import { Color, StatusColor } from '@cc/app/styles';
import { getUnionValue } from '@cc/utils/get-union-key';

@Component({
    selector: 'cc-modification-unit-timeline-item',
    templateUrl: './modification-unit-timeline-item.component.html',
})
export class ModificationUnitTimelineItemComponent {
    @Input() modificationUnit: ModificationUnit;

    @Input() @coerceBoolean isLoading: boolean = false;
    @Input() title?: string;
    @Input() icon?: string;
    @Input() color?: StatusColor | Color;
    @Input() patches?: Patch[];

    get name() {
        return getModificationNameParts(getUnionValue(this.modificationUnit.modification)).join(
            ': '
        );
    }

    get modification() {
        return getUnionValue(getUnionValue(this.modificationUnit?.modification));
    }

    get hasModificationContent() {
        return !isEmpty(this.modification);
    }
}
