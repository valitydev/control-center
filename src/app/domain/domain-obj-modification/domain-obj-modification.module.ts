import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ActionsModule } from '@vality/ng-core';

import { ThriftDataModule } from '@cc/app/shared/components/thrift-data/thrift-data.module';

import { MonacoEditorModule } from '../../monaco-editor';
import { DomainObjModificationComponent } from './domain-obj-modification.component';
import { ResetConfirmDialogComponent } from './reset-confirm-dialog/reset-confirm-dialog.component';

@NgModule({
    declarations: [DomainObjModificationComponent, ResetConfirmDialogComponent],
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
        ThriftDataModule,
        ActionsModule,
    ],
    exports: [DomainObjModificationComponent],
})
export class DomainObjModificationModule {}
