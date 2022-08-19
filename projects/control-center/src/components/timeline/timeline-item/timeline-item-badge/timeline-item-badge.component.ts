import { Component, Input } from '@angular/core';

import { Color, StatusColor } from '@cc/app/styles';

@Component({
    selector: 'cc-timeline-item-badge',
    templateUrl: 'timeline-item-badge.component.html',
    styleUrls: ['timeline-item-badge.component.scss'],
})
export class TimelineItemBadgeComponent {
    @Input() color: StatusColor | Color;

    statusColorEnum = StatusColor;
    colorEnum = Color;
}
