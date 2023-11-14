import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

import { MetadataFormModule } from '@cc/app/shared/components/metadata-form';
import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { ThriftEditorComponent } from './thrift-editor.component';

@NgModule({
    declarations: [ThriftEditorComponent],
    exports: [ThriftEditorComponent],
    imports: [
        CommonModule,
        MetadataFormModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
    ],
})
export class ThriftEditorModule {}
