import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

import { ActionsModule, DialogModule, TableModule } from '@vality/matez';
import { ThriftFormModule } from '@vality/ng-thrift';

import { FistfulThriftFormComponent } from '~/components/fistful-thrift-form';
import { PageLayoutModule } from '~/components/page-layout';

import { CreateSourceComponent } from './create-source/create-source.component';
import { SourcesRoutingModule } from './sources-routing.module';
import { SourcesComponent } from './sources.component';

@NgModule({
    imports: [
        CommonModule,
        SourcesRoutingModule,
        ActionsModule,
        MatButtonModule,
        MatCardModule,
        MatProgressBarModule,
        TableModule,
        MatTableModule,
        DialogModule,
        ThriftFormModule,
        ReactiveFormsModule,
        PageLayoutModule,
        FistfulThriftFormComponent,
    ],
    declarations: [SourcesComponent, CreateSourceComponent],
})
export class SourcesModule {}
