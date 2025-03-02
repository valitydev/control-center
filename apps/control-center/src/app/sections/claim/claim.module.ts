import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ActionsModule, DialogModule, PipesModule } from '@vality/matez';
import { ThriftFormModule, ThriftPipesModule, ThriftViewerModule } from '@vality/ng-thrift';

import { TimelineModule } from '../../../components/timeline/timeline.module';
import { PageLayoutModule } from '../../shared';
import { StatusModule } from '../../shared/components/status/status.module';
import { DomainThriftFormComponent } from '../../shared/components/thrift-api-crud';

import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { AddModificationDialogComponent } from './components/add-modification-dialog/add-modification-dialog.component';
import { ChangeStatusDialogComponent } from './components/change-status-dialog/change-status-dialog.component';
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
        ShopModificationTimelineItemComponent,
        AddModificationDialogComponent,
        ChangeStatusDialogComponent,
        TimelineItemHeaderComponent,
        TimelineItemLoadingComponent,
    ],
    imports: [
        CommonModule,
        ClaimRoutingModule,
        RouterModule,
        TimelineModule,
        MatIconModule,
        ThriftPipesModule,
        MatExpansionModule,
        ThriftViewerModule,
        MatCardModule,
        StatusModule,
        MatDividerModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        ThriftFormModule,
        MatMenuModule,
        MatDialogModule,
        MatProgressBarModule,
        DialogModule,
        ActionsModule,
        PageLayoutModule,
        PipesModule,
        DomainThriftFormComponent,
    ],
})
export class ClaimModule {}
