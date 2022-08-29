import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild, Optional, OnInit, OnDestroy } from '@angular/core';
import { MatTable, MatNoDataRow } from '@angular/material/table';

@Component({
    selector: 'cc-no-data-row',
    templateUrl: './no-data-row.component.html',
})
export class NoDataRowComponent<T> implements OnInit, OnDestroy {
    @ViewChild(MatNoDataRow, { static: true }) matNoDataRow!: MatNoDataRow;

    selection = new SelectionModel(true, []);

    constructor(@Optional() public table: MatTable<T>) {}

    ngOnInit(): void {
        if (this.table) {
            this.table.setNoDataRow(this.matNoDataRow);
        }
    }

    ngOnDestroy(): void {
        if (this.table) {
            this.table.setNoDataRow(null);
        }
    }
}
