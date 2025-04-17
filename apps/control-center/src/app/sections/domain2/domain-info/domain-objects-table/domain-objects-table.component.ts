import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomainObject, DomainObjectTypes } from '@vality/domain-proto/domain';
import { VersionedObjectInfo } from '@vality/domain-proto/domain_config_v2';
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
import { first, map, share, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

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
    columns: Column<VersionedObjectInfo>[] = [
        {
            field: 'id',
            cell: (d) => ({ value: getReferenceId(d.ref) }),
            sticky: 'start',
        },
        {
            field: 'name',
            cell: (d) => ({
                value: getReferenceId(d.ref),
                click: () => this.details(d),
            }),
            style: { width: 0 },
        },
        {
            field: 'description',
            cell: (d) => ({ value: getReferenceId(d.ref) }),
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
                        this.domainStoreService
                            .getObject(d.ref)
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
                        this.deleteDomainObjectService.delete(d.ref);
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

    constructor(
        private fetchDomainObjectsService: FetchDomainObjectsService,
        private metadataService: MetadataService,
        private qp: QueryParamsService<{ type?: string }>,
        private sidenavInfoService: SidenavInfoService,
        private deleteDomainObjectService: DeleteDomainObjectService,
        private destroyRef: DestroyRef,
        private dialogService: DialogService,
        private domainStoreService: DomainStoreService,
    ) {}

    ngOnInit() {
        this.typeControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((type) => {
                void this.qp.set({ type });
            });
        getValueChanges(this.typeControl)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((type) => {
                this.selectedTypeChange.emit(type);
                if (type) {
                    DOMAIN_OBJECT_TYPES$.pipe(
                        withLatestFrom(this.metadataService.getDomainFieldByType(type)),
                        first(),
                    ).subscribe(([types, field]) => {
                        console.log(types, field);
                        this.fetchDomainObjectsService.load({ type: types[field.name] });
                    });
                } else {
                    this.fetchDomainObjectsService.load({});
                }
            });
    }

    update() {
        this.fetchDomainObjectsService.reload();
    }

    details(d: VersionedObjectInfo) {
        this.sidenavInfoService.toggle(DomainObjectCardComponent, { ref: d.ref });
    }
}
