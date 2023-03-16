import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActionsModule } from '@vality/ng-core';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { TableModule } from '../../../components/table';
import { SourcesRoutingModule } from './sources-routing.module';
import { SourcesComponent } from './sources.component';

@NgModule({
    imports: [
        CommonModule,
        SourcesRoutingModule,
        FlexModule,
        ActionsModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        EmptySearchResultModule,
        TableModule,
        MatTableModule,
    ],
    declarations: [SourcesComponent],
})
export class SourcesModule {}
