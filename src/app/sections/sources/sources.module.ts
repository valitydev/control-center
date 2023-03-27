import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActionsModule, BaseDialogModule } from '@vality/ng-core';

import { SimpleTableModule } from '@cc/components/simple-table';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { TableModule } from '../../../components/table';
import { MetadataFormModule } from '../../shared/components/metadata-form';
import { CreateSourceComponent } from './create-source/create-source.component';
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
        BaseDialogModule,
        MetadataFormModule,
        ReactiveFormsModule,
        SimpleTableModule,
    ],
    declarations: [SourcesComponent, CreateSourceComponent],
})
export class SourcesModule {}
