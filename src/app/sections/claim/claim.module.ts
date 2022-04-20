import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer/json-viewer.module';
import { ThriftPipesModule } from '@cc/app/shared/pipes';
import { TimelineModule } from '@cc/components/timeline';

import { TimelineComponentsModule } from '../party-claim/changeset/timeline-components';
import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { ModificationUnitTimelineItemComponent } from './components/modification-unit-timeline-item/modification-unit-timeline-item.component';
import { StatusModificationTimelineItemComponent } from './components/status-modification-timeline-item/status-modification-timeline-item.component';

@NgModule({
    declarations: [
        ClaimComponent,
        ModificationUnitTimelineItemComponent,
        StatusModificationTimelineItemComponent,
    ],
    imports: [
        CommonModule,
        ClaimRoutingModule,
        FlexLayoutModule,
        RouterModule,
        TimelineModule,
        MatIconModule,
        TimelineComponentsModule,
        ThriftPipesModule,
        MatExpansionModule,
        JsonViewerModule,
    ],
})
export class ClaimModule {}
