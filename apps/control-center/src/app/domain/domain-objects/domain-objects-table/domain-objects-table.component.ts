import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Injector, OnInit, inject, model, output } from '@angular/core';
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
    getEnumKeys,
    getValueChanges,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { combineLatest, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { FetchDomainObjectsService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../../shared/components/sidenav-info';
import { getReferenceId } from '../../../shared/components/thrift-api-crud';
import {
    DomainObjectCardComponent,
    DomainObjectService,
} from '../../../shared/components/thrift-api-crud/domain2';

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
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);
    private qp = inject<QueryParamsService<{ type?: keyof ReflessDomainObject; filter?: string }>>(
        QueryParamsService<{ type?: keyof ReflessDomainObject; filter?: string }>,
    );
    private sidenavInfoService = inject(SidenavInfoService);
    private domainObjectService = inject(DomainObjectService);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);
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
                    this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: d.ref,
                        version: d.info.version,
                    });
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
                        this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                            ref: d.ref,
                            version: d.info.version,
                        });
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
    options = getEnumKeys(DomainObjectType)
        .sort()
        .map((type) => ({
            label: startCase(String(type)),
            value: type,
        }));
    isLoading$ = this.fetchDomainObjectsService.isLoading$;
    hasMore$ = this.fetchDomainObjectsService.hasMore$;
    filter = model<string>(this.qp.params.filter);

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
                    this.fetchDomainObjectsService.load({ type: DomainObjectType[type], query });
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
