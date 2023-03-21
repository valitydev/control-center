import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    ],
    declarations: [SimpleTableComponent],
    exports: [SimpleTableComponent],
})
export class SimpleTableModule {}
