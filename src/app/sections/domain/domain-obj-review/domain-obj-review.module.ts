import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { RouterModule } from '@angular/router';
import { ActionsModule } from '@vality/ng-core';

import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { ThriftEditorModule } from '../../../shared/components/thrift-editor';
import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';
import { DomainObjReviewComponent } from './domain-obj-review.component';

@NgModule({
    declarations: [DomainObjReviewComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
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
    ],
    exports: [DomainObjReviewComponent],
})
export class DomainObjReviewModule {}
