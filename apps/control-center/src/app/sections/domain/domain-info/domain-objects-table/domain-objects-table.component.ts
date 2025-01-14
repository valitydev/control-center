import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, OnInit, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import {
    ActionsModule,
    Column,
    DialogService,
    QueryParamsService,
    SelectFieldModule,
    TableModule,
    createMenuColumn,
    getValueChanges,
} from '@vality/matez';
import sortBy from 'lodash-es/sortBy';
import startCase from 'lodash-es/startCase';
import { Observable, combineLatest, forkJoin, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '../../../../api/domain-config/stores/domain-store.service';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import {
    DeleteDomainObjectService,
    DomainObjectCardComponent,
    DomainThriftViewerComponent,
    EditDomainObjectDialogComponent,
    getDomainObjectDetails,
} from '../../../../shared/components/thrift-api-crud';
import { MetadataService } from '../../services/metadata.service';

interface DomainObjectData {
    type: string;
    ref: Reference;
    obj: DomainObject;
}

@Component({
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
    ]
})
export class DomainObjectsTableComponent implements OnInit {
    @Output() selectedChange = new EventEmitter<string[]>();

    typesControl = new FormControl<string[]>(
        (this.qp.params.types as (keyof DomainObject)[]) || [],
    );
    objects$: Observable<DomainObjectData[]> = combineLatest([
        this.domainStoreService.domain$,
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
            cell: (d) => ({ value: getDomainObjectDetails(d.obj).id }),
            sticky: 'start',
        },
        {
            field: 'name',
            cell: (d) => ({
                value: getDomainObjectDetails(d.obj).label,
                click: () => this.details(d),
            }),
            style: { width: 0 },
        },
        {
            field: 'description',
            cell: (d) => ({ value: getDomainObjectDetails(d.obj).description }),
        },
        {
            field: 'type',
            cell: (d) => ({ value: startCase(d.type) }),
            hidden: getValueChanges(this.typesControl).pipe(map((t) => t.length <= 1)),
        },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    click: () => {
                        this.details(d);
                    },
                },
                {
                    label: 'Edit',
                    click: () => {
                        this.dialogService
                            .open(EditDomainObjectDialogComponent, { domainObject: d.obj })
                            .afterClosed()
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe();
                    },
                },
                {
                    label: 'Delete',
                    click: () => {
                        this.deleteDomainObjectService.delete(d.ref);
                    },
                },
            ],
        })),
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

    constructor(
        private domainStoreService: DomainStoreService,
        private metadataService: MetadataService,
        private qp: QueryParamsService<{ types?: string[] }>,
        private sidenavInfoService: SidenavInfoService,
        private deleteDomainObjectService: DeleteDomainObjectService,
        private destroyRef: DestroyRef,
        private dialogService: DialogService,
    ) {}

    ngOnInit() {
        this.typesControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((types) => {
                void this.qp.patch({ types });
            });
        getValueChanges(this.typesControl)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((types) => {
                this.selectedChange.emit(types);
            });
    }

    update() {
        this.domainStoreService.forceReload();
    }

    details(d: DomainObjectData) {
        this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.ref });
    }
}
