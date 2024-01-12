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

import { PageLayoutModule } from '../../../shared';

import { DomainObjModificationComponent } from './domain-obj-modification.component';

@NgModule({
    declarations: [DomainObjModificationComponent],
    imports: [
        CommonModule,

        RouterModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        ReactiveFormsModule,
        ThriftEditorModule,
        ActionsModule,
        PageLayoutModule,
    ],
    exports: [DomainObjModificationComponent],
})
export class DomainObjModificationModule {}
