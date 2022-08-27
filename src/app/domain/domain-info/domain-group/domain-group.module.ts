import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PipesModule } from '@vality/ng-core';

import { PrettyJsonModule } from '@cc/components/pretty-json';

import { TableModule } from '../../../../components/table';
import { ThriftPipesModule } from '../../../shared';
import { SelectModule } from '../../../shared/components/select';
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
