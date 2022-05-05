import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';

import { MetadataFormModule, StatusModule } from '@cc/app/shared/components';
import { JsonViewerModule } from '@cc/app/shared/components/json-viewer/json-viewer.module';
import { ThriftPipesModule } from '@cc/app/shared/pipes';
import { TimelineModule } from '@cc/components/timeline';

import { TimelineComponentsModule } from '../party-claim/changeset/timeline-components';
import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { CommentModificationTimelineItemComponent } from './components/comment-modification-timeline-item/comment-modification-timeline-item.component';
import { ModificationUnitTimelineItemComponent } from './components/modification-unit-timeline-item/modification-unit-timeline-item.component';
import { ShopModificationTimelineItemComponent } from './components/shop-modification-timeline-item/shop-modification-timeline-item.component';
import { StatusModificationTimelineItemComponent } from './components/status-modification-timeline-item/status-modification-timeline-item.component';

@NgModule({
    declarations: [
        ClaimComponent,
        ModificationUnitTimelineItemComponent,
        StatusModificationTimelineItemComponent,
        CommentModificationTimelineItemComponent,
        ShopModificationTimelineItemComponent,
        AddModificationDialogComponent,
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
        MatProgressSpinnerModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MetadataFormModule,
        MatMenuModule,
    ],
})
export class ClaimModule {}
