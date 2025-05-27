import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, model, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject, DomainObjectType, ReflessDomainObject } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    ActionsModule,
    Column,
    DialogResponseStatus,
    QueryParamsService,
    SelectFieldModule,
    TableModule,
    createMenuColumn,
    getImportValue,
    getValueChanges,
} from '@vality/matez';
import { ThriftAstMetadata, createThriftEnum, getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { combineLatest, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, share, shareReplay } from 'rxjs/operators';

import { FetchDomainObjectsService } from '../../../../api/domain-config';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import {
    DomainObjectCardComponent,
    getReferenceId,
} from '../../../../shared/components/thrift-api-crud';
import { DomainObjectService } from '../../../../shared/components/thrift-api-crud/domain2';

const DOMAIN_OBJECT_TYPES$ = getImportValue<ThriftAstMetadata[]>(
    import('@vality/domain-proto/metadata.json'),
).pipe(
    map((metadata) => createThriftEnum<DomainObjectType>(metadata, 'domain', 'DomainObjectType')),
    share(),
);

@Component({
    selector: 'cc-domain-objects-table',
    templateUrl: './domain-objects-table.component.html',
    imports: [
        CommonModule,
        SelectFieldModule,
        TableModule,
        ReactiveFormsModule,
        ActionsModule,
        MatButtonModule,
    ],
})
export class DomainObjectsTableComponent implements OnInit {
    selectedTypeChange = output<keyof ReflessDomainObject>();

    typeControl = new FormControl<keyof ReflessDomainObject>(
        this.qp.params.type as keyof DomainObject,
    );
    objects$ = this.fetchDomainObjectsService.result$;
    columns: Column<LimitedVersionedObject>[] = [
        { field: 'id', cell: (d) => ({ value: getReferenceId(d.ref) }), sticky: 'start' },
        {
            field: 'name',
            cell: (d) => ({
                value: d.name,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.ref });
                },
            }),
            style: { width: 0 },
        },
        { field: 'description', cell: (d) => ({ value: d.description }) },
        {
            field: 'type',
            cell: (d) => ({ value: startCase(String(getUnionKey(d.ref))) }),
        },
        { field: 'version', cell: (d) => ({ value: d.info.version }) },
        { field: 'changed_at', cell: (d) => ({ value: d.info.changed_at, type: 'datetime' }) },
        {
            field: 'changed_by',
            cell: (d) => ({
                value: d.info.changed_by?.name,
                description: d.info.changed_by?.email,
            }),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () => {
                        this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.ref });
                    },
                },
                {
                    label: 'Edit',
                    click: () => {
                        this.domainObjectService.edit(d.ref).next((res) => {
                            if (res.status === DialogResponseStatus.Success) {
                                this.fetchDomainObjectsService.reload();
                            }
                        });
                    },
                },
                {
                    label: 'Delete',
                    click: () => {
                        this.domainObjectService.delete(d.ref).next(() => {
                            this.fetchDomainObjectsService.reload();
                        });
                    },
                },
            ],
        })),
    ];
    options$ = DOMAIN_OBJECT_TYPES$.pipe(
        map((types) =>
            Object.keys(types)
                .sort()
                .map((type) => ({
                    label: startCase(String(type)),
                    value: type,
                })),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = this.fetchDomainObjectsService.isLoading$;
    hasMore$ = this.fetchDomainObjectsService.hasMore$;
    filter = model<string>(this.qp.params.filter);

    constructor(
        private fetchDomainObjectsService: FetchDomainObjectsService,
        private qp: QueryParamsService<{ type?: keyof ReflessDomainObject; filter?: string }>,
        private sidenavInfoService: SidenavInfoService,
        private domainObjectService: DomainObjectService,
        private dr: DestroyRef,
        private injector: Injector,
    ) {}

    ngOnInit() {
        merge(this.typeControl.valueChanges, this.qp.params$.pipe(map((params) => params.type)))
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.dr))
            .subscribe((type) => {
                this.selectedTypeChange.emit(type);
                this.typeControl.setValue(type, { emitEvent: false });
                void this.qp.patch({ type });
            });
        toObservable(this.filter, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((filter) => {
                void this.qp.patch({ filter });
            });
        combineLatest([
            getValueChanges(this.typeControl),
            toObservable(this.filter, { injector: this.injector }).pipe(debounceTime(300)),
        ])
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(([type, query]) => {
                if (type) {
                    DOMAIN_OBJECT_TYPES$.pipe(first()).subscribe((types) => {
                        this.fetchDomainObjectsService.load({ type: types[type], query });
                    });
                } else {
                    this.fetchDomainObjectsService.load({ query });
                }
            });
    }

    update() {
        this.fetchDomainObjectsService.reload();
    }

    more() {
        this.fetchDomainObjectsService.more();
    }
}
