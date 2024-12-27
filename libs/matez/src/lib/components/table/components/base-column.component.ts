import { input, viewChild, OnDestroy, Directive, inject, OnInit } from '@angular/core';
import {
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatHeaderCellDef,
    MatFooterCellDef,
} from '@angular/material/table';

@Directive()
export class BaseColumnComponent implements OnDestroy, OnInit {
    name = input.required<string>();
    table = inject(MatTable);

    columnDef = viewChild(MatColumnDef);
    cellDef = viewChild(MatCellDef);
    headerCellDef = viewChild(MatHeaderCellDef);
    footerCellDef = viewChild(MatFooterCellDef);

    addedColumnDef?: MatColumnDef;

    ngOnInit() {
        const columnDef = this.columnDef();
        if (columnDef) {
            columnDef.name = this.name();
            columnDef.cell = this.cellDef() as never;
            columnDef.headerCell = this.headerCellDef() as never;
            columnDef.footerCell = this.footerCellDef() as never;
            this.removeColumnDef();
            this.table.addColumnDef(columnDef);
            this.addedColumnDef = columnDef;
        }
    }

    ngOnDestroy() {
        this.removeColumnDef();
    }

    private removeColumnDef() {
        if (this.table && this.addedColumnDef) {
            this.table.removeColumnDef(this.addedColumnDef);
        }
    }
}
