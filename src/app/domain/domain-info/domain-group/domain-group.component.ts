import { Component, ViewChildren, QueryList, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Reference, DomainObject } from '@vality/domain-proto/lib/domain';
import sortBy from 'lodash-es/sortBy';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, startWith, shareReplay } from 'rxjs/operators';

import { Columns } from '../../../../components/table';
import { objectToJSON } from '../../../api/utils';
import { QueryParamsService } from '../../../shared/services';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { MetadataService } from '../../services/metadata.service';
import { DataSourceItem } from './types/data-source-item';
import { filterPredicate } from './utils/filter-predicate';
import { sortData } from './utils/sort-table-data';

interface Params {
    types?: string[];
}

@UntilDestroy()
@Component({
    selector: 'cc-domain-group',
    templateUrl: './domain-group.component.html',
    styleUrls: ['./domain-group.component.scss'],
})
export class DomainGroupComponent implements OnInit {
    @Output() refChange = new EventEmitter<{ ref: Reference; obj: DomainObject }>();

    @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    searchControl = new FormControl('');
    typesControl = new FormControl(this.queryParamsService.params.types || []);
    dataSource$: Observable<MatTableDataSource<DataSourceItem>> =
        this.domainStoreService.domain$.pipe(
            map((domain) => Array.from(domain).map(([ref, obj]) => ({ ref, obj }))),
            switchMap((data) =>
                combineLatest(
                    data.map((d) => this.metadataService.getDomainObjectType(d.ref))
                ).pipe(
                    map((r) =>
                        r.map((type, idx) => ({
                            ...data[idx],
                            type,
                            stringified: JSON.stringify(
                                objectToJSON([data[idx].obj, data[idx].ref, type])
                            ),
                        }))
                    )
                )
            ),
            switchMap((data: DataSourceItem[]) =>
                combineLatest([
                    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
                    this.typesControl.valueChanges.pipe(startWith(this.typesControl.value)),
                    this.paginator.changes.pipe(startWith(this.paginator)),
                    this.sort.changes.pipe(startWith(this.sort)),
                ]).pipe(
                    map(([searchStr, selectedTypes]) =>
                        this.createMatTableDataSource(data, searchStr, selectedTypes)
                    )
                )
            ),
            shareReplay({ refCount: true, bufferSize: 1 })
        );
    cols = new Columns('type', 'ref', 'obj', 'actions');
    fields$ = this.metadataService.getDomainFields().pipe(
        map((fields) => sortBy(fields, 'type')),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    options$ = this.fields$.pipe(
        map((fields) => fields.map(({ type }) => ({ label: type, value: type })))
    );
    isLoading$ = this.domainStoreService.isLoading$;

    constructor(
        private domainStoreService: DomainStoreService,
        private metadataService: MetadataService,
        private queryParamsService: QueryParamsService<Params>
    ) {}

    ngOnInit() {
        this.typesControl.valueChanges.subscribe((types) => {
            void this.queryParamsService.set({ types });
        });
    }

    openDetails(item: DataSourceItem) {
        this.refChange.emit({ ref: item.ref, obj: item.obj });
    }

    private createMatTableDataSource(
        data: DataSourceItem[],
        searchStr: string,
        selectedTypes: string[]
    ) {
        const dataSource = new MatTableDataSource(
            data.filter((d) => selectedTypes.includes(d.type))
        );
        dataSource.paginator = this.paginator?.first;
        dataSource.sort = this.sort?.first;
        dataSource.sortData = sortData;
        dataSource.filterPredicate = filterPredicate;
        dataSource.filter = searchStr.trim();
        return dataSource;
    }
}
