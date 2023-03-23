import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { PipesModule } from '@vality/ng-core';

import { PrettyJsonModule } from '@cc/components/pretty-json';

import { TableModule } from '../../../../../components/table';
import { ThriftPipesModule } from '../../../../shared';
import { SelectModule } from '../../../../shared/components/select';
import { DomainGroupComponent } from './domain-group.component';

@NgModule({
    declarations: [DomainGroupComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatExpansionModule,
        MatTableModule,
        CdkTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        FlexLayoutModule,
        MatCardModule,
        MatCheckboxModule,
        MatSelectModule,
        MatSortModule,
        PrettyJsonModule,
        PipesModule,
        TableModule,
        ReactiveFormsModule,
        SelectModule,
        MatProgressSpinnerModule,
        ThriftPipesModule,
    ],
    exports: [DomainGroupComponent],
})
export class DomainGroupModule {}
