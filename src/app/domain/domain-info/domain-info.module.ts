import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PipesModule } from '@vality/ng-core';

import { MonacoEditorModule } from '../../monaco-editor';
import { ThriftViewerModule } from '../../shared/components/thrift-viewer';
import { DamselModule } from '../../thrift-services/damsel';
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
        DamselModule,
        ThriftViewerModule,
        PipesModule,
        RouterModule,
    ],
})
export class DomainInfoModule {}
