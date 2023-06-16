import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ActionsModule, DialogModule, TableModule } from '@vality/ng-core';

import { EmptySearchResultModule } from '../../../components/empty-search-result';
import { PageLayoutModule } from '../../shared';
import { FistfulThriftFormComponent } from '../../shared/components/fistful-thrift-form';
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
        DialogModule,
        MetadataFormModule,
        ReactiveFormsModule,
        PageLayoutModule,
        FistfulThriftFormComponent,
    ],
    declarations: [SourcesComponent, CreateSourceComponent],
})
export class SourcesModule {}
