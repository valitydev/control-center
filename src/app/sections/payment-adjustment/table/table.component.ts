import { SelectionModel } from '@angular/cdk/collections';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { StatPayment } from '@vality/domain-proto/lib/merch_stat';
import { Int64 } from '@vality/thrift-ts';

import { i64ToNumber } from '@cc/utils/i64-to-number';

@Component({
    selector: 'cc-payment-adjustment-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnChanges {
    @Input()
    payments: StatPayment[] = [];

    @Output()
    changeSelected: EventEmitter<StatPayment[]> = new EventEmitter();

    dataSource: MatTableDataSource<StatPayment> = new MatTableDataSource();

    selection = new SelectionModel<StatPayment>(true, []);

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    cols = ['select', 'revision', 'invoiceId', 'createdAt', 'ownerId'];

    ngOnChanges(changes: SimpleChanges) {
        const { payments } = changes;
        if (payments && payments.currentValue) {
            this.selection.clear();
            this.changeSelected.emit([]);
            this.dataSource.data = payments.currentValue;
        }
    }

    ngOnInit() {
        this.selection.changed.subscribe((e) => this.changeSelected.emit(e.source.selected));
        this.dataSource.filterPredicate = ({ domain_revision }, filter) => {
            const num = i64ToNumber(
                ((domain_revision as unknown) as Int64).buffer,
                ((domain_revision as unknown) as Int64).offset
            );
            return filter === num.toString();
        };
        this.dataSource.paginator = this.paginator;
    }

    applyFilter(filterValue: string) {
        this.selection.clear();
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    masterToggle() {
        if (this.isAllSelected()) this.selection.clear();
        else this.selection.select(...this.dataSource.filteredData);
    }

    isAllSelected() {
        return this.selection.selected.length === this.dataSource.filteredData.length;
    }
}
