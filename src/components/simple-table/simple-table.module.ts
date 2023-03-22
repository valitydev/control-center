import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { TableModule } from '@cc/components/table';

import { EmptySearchResultModule } from '../empty-search-result';
import { SimpleTableComponent } from './simple-table.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatCardModule,
        TableModule,
        EmptySearchResultModule,
        MatProgressSpinnerModule,
        FlexModule,
        MatInputModule,
        MatSelectModule,
    ],
    declarations: [SimpleTableComponent],
    exports: [SimpleTableComponent],
})
export class SimpleTableModule {}
