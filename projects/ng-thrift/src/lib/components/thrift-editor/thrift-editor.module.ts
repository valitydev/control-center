import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PipesModule } from '@vality/matez';
import { MonacoEditorModule } from '@vality/ng-monaco-editor';

import { ThriftMonacoComponent } from '../thrift-monaco/thrift-monaco.component';

import { ThriftFormModule } from './components/thrift-form';
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
        ThriftMonacoComponent,
    ],
})
export class ThriftEditorModule {}
