import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ActionsModule } from '@vality/ng-core';

import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { PageLayoutModule } from '../../../shared';
import { ThriftEditorModule } from '../../../shared/components/thrift-editor';
import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';

import { DomainObjReviewComponent } from './domain-obj-review.component';

@NgModule({
    declarations: [DomainObjReviewComponent],
    imports: [
        CommonModule,

        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatCheckboxModule,
        MonacoEditorModule,
        MatIconModule,
        ThriftEditorModule,
        MatProgressSpinnerModule,
        ActionsModule,
        ReactiveFormsModule,
        ThriftViewerModule,
        PageLayoutModule,
    ],
    exports: [DomainObjReviewComponent],
})
export class DomainObjReviewModule {}
