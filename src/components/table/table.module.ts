import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { MenuCellComponent } from '@cc/components/table/menu-cell/menu-cell.component';

import { NoDataRowComponent } from './no-data-row/no-data-row.component';
import { ShowMoreButtonComponent } from './show-more-button/show-more-button.component';

/**
 * @deprecated
 */
@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatCheckboxModule,
        MatButtonModule,
        MatSortModule,
        MatMenuModule,
        MatIconModule,
    ],
    declarations: [ShowMoreButtonComponent, MenuCellComponent, NoDataRowComponent],
    exports: [ShowMoreButtonComponent, MenuCellComponent, NoDataRowComponent],
})
export class TableModule {}
