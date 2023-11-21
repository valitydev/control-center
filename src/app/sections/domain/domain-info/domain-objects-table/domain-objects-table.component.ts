import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
import isEqual from 'lodash-es/isEqual';
import sortBy from 'lodash-es/sortBy';
import startCase from 'lodash-es/startCase';
import { combineLatest, Observable, forkJoin, of } from 'rxjs';
import { map, shareReplay, withLatestFrom, filter, startWith, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import {
    getDomainObjectDetails,
    DomainThriftViewerComponent,
    DomainObjectCardComponent,
} from '../../../../shared/components/thrift-api-crud';
import { MetadataService } from '../../services/metadata.service';

interface DomainObjectData {
    type: string;
    ref: Reference;
    obj: DomainObject;
}

interface Params {
    types?: string[];
    ref?: Reference;
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
    // @ViewChild('objTpl') contractTpl: TemplateRef<unknown>;

    @Output() refChange = new EventEmitter<{ ref: Reference; obj: DomainObject }>();

    typesControl = new FormControl<string[]>(
        (this.queryParamsService.params.types as (keyof DomainObject)[]) || [],
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
    columns$: Observable<Column<DomainObjectData>[]> = this.typesControl.valueChanges.pipe(
        startWith(this.typesControl.value),
        map((types) => [
            {
                field: 'id',
                formatter: (d: DomainObjectData) => getDomainObjectDetails(d.obj).id,
                sortable: true,
                click: (d) => {
                    this.sidenavInfoService.openComponent(DomainObjectCardComponent, {
                        label: 'hell xx',
                    });
                    // this.selectedObj = d;
                    // this.sidenavInfoService.toggle(
                    //     this.contractTpl,
                    //     getDomainObjectDetails(d.obj).label,
                    //     d.ref,
                    // );
                },
            },
            {
                field: 'name',
                formatter: (d: DomainObjectData) => getDomainObjectDetails(d.obj).label,
                sortable: true,
            },
            {
                field: 'type',
                sortable: true,
                formatter: (d) => startCase(d.type),
                hide: types.length <= 1,
            },
            // {
            //     field: 'object',
            //     formatter: (d) => inlineJson(getUnionValue(d.obj)?.data, Infinity),
            //     sortable: true,
            // },
            createOperationColumn([
                {
                    label: 'Details',
                    click: (d) => {
                        // void this.queryParamsService.patch({ ref: d.ref });
                        // this.selectedObj = d;
                        // this.sidenavInfoService.toggle(
                        //     this.contractTpl,
                        //     getDomainObjectDetails(d.obj).label,
                        //     d.ref,
                        // );
                    },
                },
            ]),
        ]),
    );
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
    selectedObj?: DomainObjectData;

    constructor(
        private domainStoreService: DomainStoreService,
        private metadataService: MetadataService,
        private queryParamsService: QueryParamsService<Params>,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnInit() {
        this.typesControl.valueChanges.subscribe((types) => {
            void this.queryParamsService.patch({ types });
        });
        this.queryParamsService.params$
            .pipe(
                filter((p) => !!p.ref),
                withLatestFrom(this.domainStoreService.getDomain()),
            )
            .subscribe(([params, domain]) => {
                domain.forEach((obj, ref) => {
                    if (isEqual(params.ref, ref)) {
                        this.refChange.emit({ ref, obj: obj });
                    }
                });
            });
    }

    update() {
        this.domainStoreService.forceReload();
    }
}
