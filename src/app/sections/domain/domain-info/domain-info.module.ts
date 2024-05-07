import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { PipesModule, ActionsModule } from '@vality/ng-core';
import { ThriftPipesModule } from '@vality/ng-thrift';

import { PageLayoutModule } from '../../../shared';
import { DomainThriftViewerComponent } from '../../../shared/components/thrift-api-crud';
import { ThriftViewerModule } from '../../../shared/components/thrift-viewer';

import { DomainInfoComponent } from './domain-info.component';
import { DomainObjectsTableComponent } from './domain-objects-table';

@NgModule({
    declarations: [DomainInfoComponent],
    imports: [
        CommonModule,
        DomainObjectsTableComponent,
        MatCardModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatSidenavModule,
        MatButtonModule,
        MatInputModule,
        MatProgressSpinnerModule,
        ThriftViewerModule,
        PipesModule,
        RouterModule,
        ActionsModule,
        ThriftPipesModule,
        PageLayoutModule,
        DomainThriftViewerComponent,
    ],
})
export class DomainInfoModule {}
