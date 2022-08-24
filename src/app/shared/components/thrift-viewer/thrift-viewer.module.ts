import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

import { MonacoEditorModule } from '@cc/app/monaco-editor';
import { MetadataFormModule } from '@cc/app/shared';

import { ThriftViewerComponent } from './thrift-viewer.component';

@NgModule({
    declarations: [ThriftViewerComponent],
    exports: [ThriftViewerComponent],
    imports: [
        CommonModule,
        MetadataFormModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        FlexModule,
    ],
})
export class ThriftViewerModule {}
