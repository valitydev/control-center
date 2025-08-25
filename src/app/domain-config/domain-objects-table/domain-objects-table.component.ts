import startCase from 'lodash-es/startCase';

import { CommonModule } from '@angular/common';
import { Component, inject, input, model, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { ReflessDomainObject } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    ActionsModule,
    Column,
    DialogResponseStatus,
    PagedObservableResource,
    SelectFieldModule,
    TableModule,
    TableResourceComponent,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';

import { SidenavInfoService } from '~/components/sidenav-info';
import { getReferenceId } from '~/components/thrift-api-crud';
import {
    DomainObjectCardComponent,
    DomainObjectService,
} from '~/components/thrift-api-crud/domain';

@Component({
    selector: 'cc-domain-objects-table',
    templateUrl: './domain-objects-table.component.html',
    imports: [
        CommonModule,
        SelectFieldModule,
        ReactiveFormsModule,
        ActionsModule,
        MatButtonModule,
        TableResourceComponent,
        TableModule,
    ],
})
export class DomainObjectsTableComponent {
    private sidenavInfoService = inject(SidenavInfoService);
    private domainObjectService = inject(DomainObjectService);

    selectedTypeChange = output<keyof ReflessDomainObject>();
    resource = input<PagedObservableResource<LimitedVersionedObject, unknown>>();
    filter = model<string>('');

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
                                this.resource().reload();
                            }
                        });
                    },
                },
                {
                    label: 'Delete',
                    click: () => {
                        this.domainObjectService.delete(d.ref).next(() => {
                            this.resource().reload();
                        });
                    },
                },
            ],
        })),
    ];
}
