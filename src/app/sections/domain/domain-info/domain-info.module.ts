import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { RouterModule } from '@angular/router';
import { PipesModule, ActionsModule } from '@vality/ng-core';

import { MonacoEditorModule } from '@cc/components/monaco-editor';

import { ThriftPipesModule } from '../../../shared';
import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';
import { DomainGroupModule } from './domain-group';
import { DomainInfoComponent } from './domain-info.component';

@NgModule({
    declarations: [DomainInfoComponent],
    imports: [
        CommonModule,
        DomainGroupModule,
        FlexLayoutModule,
        MatCardModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatButtonModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MonacoEditorModule,
        ThriftViewerModule,
        PipesModule,
        RouterModule,
        ActionsModule,
        ThriftPipesModule,
    ],
})
export class DomainInfoModule {}
