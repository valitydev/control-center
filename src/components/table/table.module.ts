import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';

import { MenuCellComponent } from '@cc/components/table/menu-cell/menu-cell.component';

import { NoDataRowComponent } from './no-data-row/no-data-row.component';
import { SelectColumnComponent } from './select-column/select-column.component';
import { ShowMoreButtonComponent } from './show-more-button/show-more-button.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexModule,
        MatSortModule,
        MatMenuModule,
        MatIconModule,
    ],
    declarations: [
        SelectColumnComponent,
        ShowMoreButtonComponent,
        MenuCellComponent,
        NoDataRowComponent,
    ],
    exports: [
        SelectColumnComponent,
        ShowMoreButtonComponent,
        MenuCellComponent,
        NoDataRowComponent,
    ],
})
export class TableModule {}
