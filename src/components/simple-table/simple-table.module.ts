import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MtxGridModule } from '@ng-matero/extensions/grid';
import { ActionsModule } from '@vality/ng-core';

import { TableModule } from '@cc/components/table';

import { EmptySearchResultModule } from '../empty-search-result';
import { SimpleTableActionsComponent } from './components/simple-table-actions.component';
import { SimpleTableTooltipCellTemplateComponent } from './components/simple-table-tooltip-cell-template.component';
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
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        ActionsModule,
        MatTooltipModule,
        MtxGridModule,
    ],
    declarations: [
        SimpleTableComponent,
        SimpleTableActionsComponent,
        SimpleTableTooltipCellTemplateComponent,
    ],
    exports: [
        SimpleTableComponent,
        SimpleTableActionsComponent,
        SimpleTableTooltipCellTemplateComponent,
    ],
})
export class SimpleTableModule {}
