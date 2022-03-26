import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectionStrategy,
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
import { ProviderObject } from '@vality/domain-proto';

@Component({
    templateUrl: 'select-provider.component.html',
    selector: 'cc-select-provider',
    styleUrls: ['select-provider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectProviderComponent implements OnInit, OnChanges {
    @Input() providers: ProviderObject[];

    @Output() providerIDSelected: EventEmitter<number> = new EventEmitter();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    displayedColumns: string[] = ['select', 'id', 'name', 'description'];
    dataSource: MatTableDataSource<ProviderObject> = new MatTableDataSource([]);
    selection = new SelectionModel<ProviderObject>(false, []);

    ngOnChanges(changes: SimpleChanges) {
        const { providers } = changes;
        if (providers.currentValue && providers.currentValue.length > 0) {
            this.dataSource = new MatTableDataSource(providers.currentValue);
        }
    }

    ngOnInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = (provider: ProviderObject, filter: string) =>
            JSON.stringify(provider).toLowerCase().includes(filter);
        this.selection.changed.subscribe(() => {
            const providerSelection = Array.from(this.selection.selected.values());
            if (providerSelection.length > 0) {
                this.providerIDSelected.emit(providerSelection[0].ref.id);
            }
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
}
