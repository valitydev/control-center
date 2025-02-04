import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesModule } from '@vality/matez';
import { ThriftFormModule } from '@vality/ng-thrift';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { ThriftEditorComponent } from './thrift-editor.component';

@NgModule({
    declarations: [ThriftEditorComponent],
    exports: [ThriftEditorComponent],
    imports: [
        CommonModule,
        ThriftFormModule,
        ReactiveFormsModule,
        MonacoEditorModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        PipesModule,
        MatTooltipModule,
    ],
})
export class ThriftEditorModule {}
