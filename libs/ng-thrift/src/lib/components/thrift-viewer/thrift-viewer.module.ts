import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ContentLoadingComponent } from '@vality/matez';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { ThriftTreeViewerComponent } from './components/thrift-tree-viewer';
import { ThriftViewerComponent } from './thrift-viewer.component';

@NgModule({
    declarations: [ThriftViewerComponent],
    exports: [ThriftViewerComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        ThriftTreeViewerComponent,
        FormsModule,
        ContentLoadingComponent,
    ],
})
export class ThriftViewerModule {}
