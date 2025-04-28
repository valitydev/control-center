import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, model, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject, DomainObjectTypes } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    ActionsModule,
    Column,
    DialogService,
    QueryParamsService,
    SelectFieldModule,
    TableModule,
    createMenuColumn,
    getImportValue,
    getValueChanges,
} from '@vality/matez';
import { ThriftAstMetadata, createThriftEnum } from '@vality/ng-thrift';
import sortBy from 'lodash-es/sortBy';
import startCase from 'lodash-es/startCase';
import { combineLatest } from 'rxjs';
import {
    debounceTime,
    first,
    map,
    share,
    shareReplay,
    switchMap,
    withLatestFrom,
} from 'rxjs/operators';

import { DomainStoreService, FetchDomainObjectsService } from '../../../../api/domain-config';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import {
    DeleteDomainObjectService,
    DomainObjectCardComponent,
    EditDomainObjectDialogComponent,
    getReferenceId,
} from '../../../../shared/components/thrift-api-crud';
import { MetadataService } from '../../services/metadata.service';

const DOMAIN_OBJECT_TYPES$ = getImportValue<ThriftAstMetadata[]>(
    import('@vality/domain-proto/metadata.json'),
).pipe(
    map((metadata) => createThriftEnum<DomainObjectTypes>(metadata, 'domain', 'DomainObjectTypes')),
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
    selectedTypeChange = output<string>();

    typeControl = new FormControl<string>(this.qp.params.type as keyof DomainObject);
    objects$ = this.fetchDomainObjectsService.result$;
    columns: Column<LimitedVersionedObject>[] = [
        { field: 'id', cell: (d) => ({ value: getReferenceId(d.info.ref) }), sticky: 'start' },
        {
            field: 'name',
            cell: (d) => ({
                value: d.name,
                click: () => {
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.info.ref });
                },
            }),
            style: { width: 0 },
        },
        { field: 'description', cell: (d) => ({ value: d.description }) },
        { field: 'version', cell: (d) => ({ value: d.info.version }) },
        { field: 'changed_at', cell: (d) => ({ value: d.info.changed_at }) },
        {
            field: 'changed_by',
            cell: (d) => ({ value: d.info.changed_by.name, description: d.info.changed_by.email }),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () => {
                        this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                            ref: d.info.ref,
                        });
                    },
                },
                {
                    label: 'Edit',
                    click: () => {
                        this.domainStoreService
                            .getObject(d.info.ref)
                            .pipe(
                                first(),
                                switchMap((domainObject) =>
                                    this.dialogService
                                        .open(EditDomainObjectDialogComponent, {
                                            domainObject,
                                        })
                                        .afterClosed(),
                                ),
                                takeUntilDestroyed(this.destroyRef),
                            )
                            .subscribe();
                    },
                },
                {
                    label: 'Delete',
                    click: () => {
                        this.deleteDomainObjectService.delete(d.info.ref);
                    },
                },
            ],
        })),
    ];
    options$ = this.metadataService.getDomainFields().pipe(
        map((fields) =>
            sortBy(fields, 'type').map(({ type }) => ({
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
        private metadataService: MetadataService,
        private qp: QueryParamsService<{ type?: string; filter?: string }>,
        private sidenavInfoService: SidenavInfoService,
        private deleteDomainObjectService: DeleteDomainObjectService,
        private destroyRef: DestroyRef,
        private dialogService: DialogService,
        private domainStoreService: DomainStoreService,
        private injector: Injector,
    ) {}

    ngOnInit() {
        this.typeControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((type) => {
                void this.qp.patch({ type });
            });
        toObservable(this.filter, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((filter) => {
                void this.qp.patch({ filter });
            });
        combineLatest([
            getValueChanges(this.typeControl),
            toObservable(this.filter, { injector: this.injector }).pipe(debounceTime(300)),
        ])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([type, query]) => {
                this.selectedTypeChange.emit(type);
                if (type) {
                    DOMAIN_OBJECT_TYPES$.pipe(
                        withLatestFrom(this.metadataService.getDomainFieldByType(type)),
                        first(),
                    ).subscribe(([types, field]) => {
                        this.fetchDomainObjectsService.load({ type: types[field.name], query });
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
