import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { RouterModule } from '@angular/router';
import { ActionsModule } from '@vality/ng-core';

import { ThriftEditorModule } from '@cc/app/shared/components/thrift-editor';
import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';
import { DomainObjCreationComponent } from './domain-obj-creation.component';

@NgModule({
    declarations: [DomainObjCreationComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
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
    ],
    exports: [DomainObjCreationComponent],
})
export class DomainObjCreationModule {}
