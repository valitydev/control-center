import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { ThriftFormModule } from '@cc/app/shared/components/metadata-form';

import { JsonViewerModule } from '../json-viewer';

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
        JsonViewerModule,
        MatProgressSpinnerModule,
        FormsModule,
    ],
})
export class ThriftViewerModule {}
