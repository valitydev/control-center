import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Sort } from '@angular/material/sort';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Reference, DomainObject } from '@vality/domain-proto/domain';
import {
    QueryParamsService,
    Column,
    createOperationColumn,
    SelectFieldModule,
    TableModule,
    ActionsModule,
} from '@vality/ng-core';
import sortBy from 'lodash-es/sortBy';
import startCase from 'lodash-es/startCase';
import { combineLatest, Observable, forkJoin, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import {
    getDomainObjectDetails,
    DomainThriftViewerComponent,
    DomainObjectCardComponent,
    DomainObjectService,
} from '../../../../shared/components/thrift-api-crud';
import { MetadataService } from '../../services/metadata.service';

interface DomainObjectData {
    type: string;
    ref: Reference;
    obj: DomainObject;
}

@UntilDestroy()
@Component({
    standalone: true,
    selector: 'cc-domain-objects-table',
    templateUrl: './domain-objects-table.component.html',
    imports: [
        CommonModule,
        SelectFieldModule,
        DomainThriftViewerComponent,
        TableModule,
        ReactiveFormsModule,
        ActionsModule,
        MatButtonModule,
    ],
})
export class DomainObjectsTableComponent implements OnInit {
    typesControl = new FormControl<string[]>(
        (this.qp.params.types as (keyof DomainObject)[]) || [],
    );
    objects$: Observable<DomainObjectData[]> = combineLatest([
        this.domainStoreService.getDomain(),
        this.typesControl.valueChanges.pipe(startWith(this.typesControl.value)),
    ]).pipe(
        switchMap(([objects, types]) =>
            forkJoin([
                combineLatest(
                    Array.from(objects).map(([ref, obj]) =>
                        this.metadataService
                            .getDomainObjectType(ref)
                            .pipe(map((type) => ({ type, ref, obj }))),
                    ),
                ),
                of(types),
            ]),
        ),
        map(([objects, types]) => objects.filter((o) => types.includes(o.type))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns: Column<DomainObjectData>[] = [
        {
            field: 'id',
            formatter: (d: DomainObjectData) => getDomainObjectDetails(d.obj).id,
            sortable: true,
        },
        {
            field: 'name',
            formatter: (d: DomainObjectData) => getDomainObjectDetails(d.obj).label || d.type,
            sortable: true,
            click: (d) => {
                this.details(d);
            },
        },
        {
            field: 'type',
            sortable: true,
            formatter: (d) => startCase(d.type),
        },
        // {
        //     field: 'data',
        //     formatter: (d) => inlineJson(getUnionValue(d.obj)?.data, Infinity),
        //     sortable: true,
        // },
        createOperationColumn([
            {
                label: 'Details',
                click: (d) => {
                    this.details(d);
                },
            },
            {
                label: 'Edit',
                click: (d) => {
                    void this.domainObjectService.edit(d.ref);
                },
            },
            {
                label: 'Delete',
                click: (d) => {
                    this.domainObjectService.delete(d.obj);
                },
            },
        ]),
    ];
    fields$ = this.metadataService.getDomainFields().pipe(
        map((fields) => sortBy(fields, 'type')),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    options$ = this.fields$.pipe(
        map((fields) =>
            fields.map(({ type }) => ({
                label: startCase(String(type)),
                value: type,
                type: 'Domain object',
            })),
        ),
    );
    isLoading$ = this.domainStoreService.isLoading$;
    sort: Sort = { active: 'id', direction: 'asc' };

    constructor(
        private domainStoreService: DomainStoreService,
        private metadataService: MetadataService,
        private qp: QueryParamsService<{ types?: string[] }>,
        private sidenavInfoService: SidenavInfoService,
        private domainObjectService: DomainObjectService,
    ) {}

    ngOnInit() {
        this.typesControl.valueChanges.subscribe((types) => {
            void this.qp.patch({ types });
        });
    }

    update() {
        this.domainStoreService.forceReload();
    }

    details(d: DomainObjectData) {
        this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.ref });
    }
}
