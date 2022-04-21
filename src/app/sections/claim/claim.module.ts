import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { ShopModificationTimelineItemComponent } from '@cc/app/sections/claim/components/shop-modification-timeline-item/shop-modification-timeline-item.component';
import { StatusModule } from '@cc/app/shared/components';
import { JsonViewerModule } from '@cc/app/shared/components/json-viewer/json-viewer.module';
import { ThriftPipesModule } from '@cc/app/shared/pipes';
import { TimelineModule } from '@cc/components/timeline';

import { TimelineComponentsModule } from '../party-claim/changeset/timeline-components';
import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { CommentModificationTimelineItemComponent } from './components/comment-modification-timeline-item/comment-modification-timeline-item.component';
import { ModificationUnitTimelineItemComponent } from './components/modification-unit-timeline-item/modification-unit-timeline-item.component';
import { StatusModificationTimelineItemComponent } from './components/status-modification-timeline-item/status-modification-timeline-item.component';

@NgModule({
    declarations: [
        ClaimComponent,
        ModificationUnitTimelineItemComponent,
        StatusModificationTimelineItemComponent,
        CommentModificationTimelineItemComponent,
        ShopModificationTimelineItemComponent,
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
        MatCardModule,
        StatusModule,
        MatDividerModule,
    ],
})
export class ClaimModule {}
