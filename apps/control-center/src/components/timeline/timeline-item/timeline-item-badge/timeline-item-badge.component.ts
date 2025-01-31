import { Component, Input } from '@angular/core';
import { UnionEnum } from '@vality/matez';

import { Color, StatusColor } from '../../../../app/styles/consts';

@Component({
    selector: 'cc-timeline-item-badge',
    templateUrl: 'timeline-item-badge.component.html',
    styleUrls: ['timeline-item-badge.component.scss'],
    standalone: false,
})
export class TimelineItemBadgeComponent {
    @Input() color!: UnionEnum<StatusColor | Color>;

    statusColorEnum = StatusColor;
    colorEnum = Color;
}
