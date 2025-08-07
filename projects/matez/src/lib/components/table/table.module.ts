import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';

import { ActionsModule } from '../actions';
import { ContentLoadingComponent } from '../content-loading';
import { DialogModule } from '../dialog/dialog.module';
import { InputFieldModule } from '../input-field';
import { ProgressModule } from '../progress';
import { TagModule } from '../tag';
import { ValueComponent, ValueListComponent } from '../value';

import { CustomizeComponent } from './components/customize/customize.component';
import { DndColumnComponent } from './components/dnd-column.component';
import { InfinityScrollDirective } from './components/infinity-scroll.directive';
import { NoRecordsComponent } from './components/no-records.component';
import { SelectColumnComponent } from './components/select-column.component';
import { TableActionsComponent } from './components/table-actions.component';
import { TableInfoBarComponent } from './components/table-info-bar/table-info-bar.component';
import { TableInputsComponent } from './components/table-inputs.component';
import { TableProgressBarComponent } from './components/table-progress-bar.component';
import { TableComponent } from './table.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatCardModule,
        ValueComponent,
        TableProgressBarComponent,
        NoRecordsComponent,
        ContentLoadingComponent,
        MatIcon,
        MatTooltip,
        MatIconButton,
        InfinityScrollDirective,
        ValueListComponent,
        SelectColumnComponent,
        ProgressModule,
        MatSortModule,
        MatButton,
        CdkDrag,
        CdkDropList,
        DialogModule,
        MatButtonModule,
        InputFieldModule,
        ActionsModule,
        MatBadgeModule,
        ReactiveFormsModule,
        TagModule,
        DndColumnComponent,
    ],
    declarations: [
        CustomizeComponent,
        TableComponent,
        TableInfoBarComponent,
        TableInputsComponent,
        TableActionsComponent,
    ],
    exports: [TableComponent, TableInputsComponent, TableActionsComponent],
})
export class TableModule {}
