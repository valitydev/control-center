import isEqual from 'lodash-es/isEqual';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

import {
    Column,
    DialogService,
    FiltersModule,
    InputFieldModule,
    NotifyLogService,
    Option,
    QueryParamsService,
    SelectFieldModule,
    TableResourceComponent,
    clean,
    countChanged,
    createMenuColumn,
    debounceTimeWithFirst,
    pagedObservableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createPartyColumn } from '~/utils';

import { CreateOrganizationDialogComponent } from '../create-organization-dialog';

export interface OrganizationsFilters {
    status: domain.OrganizationStatus | null;
    owner_id: domain.UserID;
}

const DEFAULT_FILTERS: OrganizationsFilters = {
    status: null,
    owner_id: '',
};

@Component({
    selector: 'cc-organizations-list',
    templateUrl: './organizations-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        PageLayoutModule,
        TableResourceComponent,
        FiltersModule,
        InputFieldModule,
        SelectFieldModule,
        FormField,
    ],
})
export class OrganizationsListComponent {
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private router = inject(Router);
    private qp = inject<QueryParamsService<Partial<OrganizationsFilters>>>(QueryParamsService);
    private dialogService = inject(DialogService);

    statusOptions: Option<domain.OrganizationStatus>[] = [
        { label: 'Active', value: domain.OrganizationStatus.active },
        { label: 'Deactivated', value: domain.OrganizationStatus.deactivated },
    ];

    filters = signal<OrganizationsFilters>({
        status: this.qp.params.status ?? DEFAULT_FILTERS.status,
        owner_id: this.qp.params.owner_id || DEFAULT_FILTERS.owner_id,
    });
    filtersControl = form(this.filters);

    active = computed(() => countChanged(this.filters(), DEFAULT_FILTERS));

    private filters$ = toObservable(this.filters).pipe(
        debounceTimeWithFirst(300),
        distinctUntilChanged(isEqual),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    organizations = pagedObservableResource<domain.Organization, OrganizationsFilters>({
        params: this.filters$,
        loader: (filters, options) =>
            this.organizationsService
                .ListOrganizations({
                    limit: options.size,
                    continuation_token: options.continuationToken,
                    status: filters?.status ?? undefined,
                    owner_id: filters?.owner_id || undefined,
                })
                .pipe(
                    map((res) => ({
                        result: res.organizations,
                        continuationToken: res.continuation_token,
                    })),
                    catchError((err) => {
                        this.log.error(err);
                        return of({ result: [] });
                    }),
                ),
    });

    columns: Column<domain.Organization>[] = [
        {
            field: 'id',
            cell: (org) => ({ value: org.id }),
        },
        {
            field: 'name',
            cell: (org) => ({
                value: org.name,
                link: () => `/parties/${org.party_id}/members`,
            }),
        },
        createPartyColumn((org) => ({ id: org.party_id })),
        {
            field: 'owner_id',
            header: 'Owner',
            cell: (org) => ({ value: org.owner_id }),
        },
        {
            field: 'status',
            cell: (org) => ({
                value:
                    org.status === domain.OrganizationStatus.active
                        ? 'Active'
                        : org.status === domain.OrganizationStatus.deactivated
                          ? 'Deactivated'
                          : String(org.status),
                color: org.status === domain.OrganizationStatus.active ? 'success' : 'warn',
            }),
        },
        {
            field: 'created_at',
            header: 'Created at',
            cell: (org) => ({ value: org.created_at, type: 'datetime' }),
        },
        createMenuColumn((org) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.router.navigate([`/parties/${org.party_id}/details`]),
                },
                {
                    label: 'Members',
                    click: () => this.router.navigate([`/parties/${org.party_id}/members`]),
                },
                {
                    label: 'Invitations',
                    click: () => this.router.navigate([`/parties/${org.party_id}/invitations`]),
                },
            ],
        })),
    ];

    constructor() {
        this.filters$.pipe(takeUntilDestroyed()).subscribe((filters) => {
            void this.qp.set(clean(filters));
        });
    }

    create(): void {
        this.dialogService
            .open(CreateOrganizationDialogComponent)
            .afterClosed()
            .subscribe((res) => {
                if (res?.status === 'success') {
                    this.organizations.reload();
                }
            });
    }

    resetFilters(): void {
        this.filters.set(DEFAULT_FILTERS);
    }
}
