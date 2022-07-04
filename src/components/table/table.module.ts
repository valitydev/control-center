import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { SelectColumnComponent } from './select-column/select-column.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexModule,
        MatSortModule,
    ],
    declarations: [SelectColumnComponent],
    exports: [SelectColumnComponent],
})
export class TableModule {}
