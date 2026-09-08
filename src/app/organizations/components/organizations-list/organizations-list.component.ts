import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
    Column,
    NotifyLogService,
    TableResourceComponent,
    createMenuColumn,
    observableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createPartyColumn } from '~/utils';

@Component({
    selector: 'cc-organizations-list',
    templateUrl: './organizations-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageLayoutModule, TableResourceComponent],
})
export class OrganizationsListComponent {
    private organizationsService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private router = inject(Router);

    organizations = observableResource({
        loader: () =>
            this.organizationsService.ListOrganizations({ limit: 100 }).pipe(
                catchError((err) => {
                    this.log.error(err);
                    return of({ organizations: [] });
                }),
            ),
        map: (res) => res.organizations || [],
    });

    columns: Column<domain.Organization>[] = [
        {
            field: 'id',
            cell: (org) => ({ value: org.id }),
        },
        {
            field: 'name',
            cell: (org) => ({ value: org.name }),
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
                    org.status === 1
                        ? 'Active'
                        : org.status === 2
                          ? 'Deactivated'
                          : String(org.status),
                color: org.status === 1 ? 'success' : 'warn',
            }),
        },
        {
            field: 'created_at',
            header: 'Created at',
            cell: (org) => ({ value: org.created_at }),
        },
        createMenuColumn((org) => ({
            items: [
                {
                    label: 'Members',
                    click: () =>
                        this.router.navigate(['/organizations/members'], {
                            queryParams: { orgId: org.id },
                        }),
                },
                {
                    label: 'Invitations',
                    click: () =>
                        this.router.navigate(['/organizations/invitations'], {
                            queryParams: { orgId: org.id },
                        }),
                },
            ],
        })),
    ];
}
