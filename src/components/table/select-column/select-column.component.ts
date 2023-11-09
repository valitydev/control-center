import { SelectionModel } from '@angular/cdk/collections';
import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild,
    booleanAttribute,
} from '@angular/core';
import {
    MatCellDef,
    MatColumnDef,
    MatFooterCellDef,
    MatHeaderCellDef,
    MatTable,
} from '@angular/material/table';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export const SELECT_COLUMN_NAME = '_select';

@UntilDestroy()
@Component({
    selector: 'cc-select-column',
    templateUrl: './select-column.component.html',
})
export class SelectColumnComponent<T> implements OnInit, OnDestroy {
    @Input() name = SELECT_COLUMN_NAME;
    @Input({ transform: booleanAttribute }) sticky = false;
    @Input() dataSource: T[];
    @Output() changed = new EventEmitter<SelectionModel<T>>();

    @ViewChild(MatColumnDef, { static: true }) columnDef!: MatColumnDef;
    @ViewChild(MatCellDef, { static: true }) cellDef!: MatCellDef;
    @ViewChild(MatHeaderCellDef, { static: true }) headerCellDef!: MatHeaderCellDef;
    @ViewChild(MatFooterCellDef, { static: true }) footerCellDef!: MatFooterCellDef;

    selection = new SelectionModel<T>(true, []);

    constructor(@Optional() private table: MatTable<T>) {}

    ngOnInit(): void {
        if (this.table && this.columnDef) {
            this.columnDef.name = this.name;
            this.columnDef.cell = this.cellDef;
            this.columnDef.headerCell = this.headerCellDef;
            this.columnDef.footerCell = this.footerCellDef;
            this.table.addColumnDef(this.columnDef);
        }
        this.selection.changed.pipe(untilDestroyed(this)).subscribe(() => {
            this.changed.emit(this.selection);
        });
    }

    ngOnDestroy(): void {
        if (this.table) {
            this.table.removeColumnDef(this.columnDef);
        }
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.selection.select(...this.dataSource);
    }
}
