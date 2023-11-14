import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TimelineItemComponent } from './timeline-item';
import { TimelineItemBadgeComponent } from './timeline-item/timeline-item-badge';
import { TimelineItemContentComponent } from './timeline-item/timeline-item-content';
import { TimelineItemTitleComponent } from './timeline-item/timeline-item-title';
import { TimelineComponent } from './timeline.component';

const EXPORTED_DECLARATIONS = [
    TimelineComponent,
    TimelineItemComponent,
    TimelineItemTitleComponent,
    TimelineItemBadgeComponent,
    TimelineItemContentComponent,
];

@NgModule({
    imports: [CommonModule],
    declarations: EXPORTED_DECLARATIONS,
    exports: EXPORTED_DECLARATIONS,
})
export class TimelineModule {}
