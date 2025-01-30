import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThriftTreeViewerModule } from '@vality/ng-thrift';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { ThriftFormModule } from '../metadata-form/thrift-form.module';

import { ThriftViewerComponent } from './thrift-viewer.component';

@NgModule({
    declarations: [ThriftViewerComponent],
    exports: [ThriftViewerComponent],
    imports: [
        CommonModule,
        ThriftFormModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        ThriftTreeViewerModule,
        MatProgressSpinnerModule,
        FormsModule,
    ],
})
export class ThriftViewerModule {}
