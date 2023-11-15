import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ActionsModule } from '@vality/ng-core';

import { ThriftEditorModule } from '@cc/app/shared/components/thrift-editor';
import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { PageLayoutModule } from '../../../shared';
import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';

import { DomainObjCreationComponent } from './domain-obj-creation.component';

@NgModule({
    declarations: [DomainObjCreationComponent],
    imports: [
        CommonModule,
        RouterModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MonacoEditorModule,
        MatDialogModule,
        ReactiveFormsModule,
        ThriftEditorModule,
        ActionsModule,
        ThriftViewerModule,
        PageLayoutModule,
    ],
    exports: [DomainObjCreationComponent],
})
export class DomainObjCreationModule {}
