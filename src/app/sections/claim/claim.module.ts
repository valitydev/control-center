import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { RouterModule } from '@angular/router';
import { ActionsModule, BaseDialogModule } from '@vality/ng-core';
import { ngfModule } from 'angular-file';

import { JsonViewerModule } from '@cc/app/shared/components/json-viewer/json-viewer.module';
import { StatusModule } from '@cc/app/shared/components/status';
import { ThriftPipesModule } from '@cc/app/shared/pipes';
import { TimelineModule } from '@cc/components/timeline';

import { MetadataFormModule } from '../../shared/components/metadata-form';
import { HumanizeDurationModule } from '../../shared/pipes/humanize-duration';
import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { ChangeStatusDialogComponent } from './components/change-status-dialog/change-status-dialog.component';
import { CommentModificationTimelineItemComponent } from './components/comment-modification-timeline-item/comment-modification-timeline-item.component';
import { ModificationFormComponent } from './components/modification-form/modification-form.component';
import { ModificationUnitTimelineItemComponent } from './components/modification-unit-timeline-item/modification-unit-timeline-item.component';
import { ShopModificationTimelineItemComponent } from './components/shop-modification-timeline-item/shop-modification-timeline-item.component';
import { StatusModificationTimelineItemComponent } from './components/status-modification-timeline-item/status-modification-timeline-item.component';
import { TimelineItemHeaderComponent } from './components/timeline-item-header/timeline-item-header.component';
import { TimelineItemLoadingComponent } from './components/timeline-item-loading/timeline-item-loading.component';

@NgModule({
    declarations: [
        ClaimComponent,
        ModificationUnitTimelineItemComponent,
        StatusModificationTimelineItemComponent,
        CommentModificationTimelineItemComponent,
        ShopModificationTimelineItemComponent,
        AddModificationDialogComponent,
        ChangeStatusDialogComponent,
        ModificationFormComponent,
        TimelineItemHeaderComponent,
        TimelineItemLoadingComponent,
    ],
    imports: [
        CommonModule,
        ClaimRoutingModule,
        FlexLayoutModule,
        RouterModule,
        TimelineModule,
        MatIconModule,
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
        ngfModule,
        MatDialogModule,
        MatProgressBarModule,
        BaseDialogModule,
        ActionsModule,
        HumanizeDurationModule,
    ],
})
export class ClaimModule {}
