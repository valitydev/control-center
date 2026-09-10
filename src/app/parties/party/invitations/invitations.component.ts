import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
    Column,
    NotifyLogService,
    TableResourceComponent,
    pagedObservableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

import { PartyStoreService } from '../party-store.service';

@Component({
    selector: 'cc-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, PageLayoutModule, TableResourceComponent],
})
export class InvitationsComponent {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private partyStoreService = inject(PartyStoreService);

    organization = this.partyStoreService.organization;

    invitations = pagedObservableResource<domain.Invitation, string>({
        params: computed(() => this.organization.value()?.id),
        loader: (orgId, options) =>
            !orgId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListInvitations(orgId, {
                          limit: options.size,
                          continuation_token: options.continuationToken,
                      })
                      .pipe(
                          map((res) => ({
                              result: res.invitations,
                              continuationToken: res.continuation_token,
                          })),
                          catchError((err) => {
                              this.log.error(err);
                              return of({ result: [] });
                          }),
                      ),
    });

    columns: Column<domain.Invitation>[] = [
        {
            field: 'id',
            cell: (inv) => ({ value: inv.id }),
        },
        {
            field: 'email',
            cell: (inv) => ({ value: inv.email }),
        },
        {
            field: 'status',
            cell: (inv) => {
                const statusMap: Record<
                    number,
                    { label: string; color: 'success' | 'warn' | 'neutral' }
                > = {
                    1: { label: 'Pending', color: 'neutral' },
                    2: { label: 'Accepted', color: 'success' },
                    3: { label: 'Expired', color: 'neutral' },
                    4: { label: 'Revoked', color: 'warn' },
                };
                const mapped = statusMap[inv.status];
                return {
                    value: mapped?.label ?? String(inv.status),
                    color: mapped?.color,
                };
            },
        },
        {
            field: 'roles',
            cell: (inv) => ({
                value: (inv.roles || []).map((r) => r.role_id).join(', ') || '—',
            }),
        },
        {
            field: 'created_at',
            header: 'Created at',
            cell: (inv) => ({ value: inv.created_at, type: 'datetime' }),
        },
        {
            field: 'expires_at',
            header: 'Expires at',
            cell: (inv) => ({ value: inv.expires_at, type: 'datetime' }),
        },
    ];

    createOrganization(): void {
        this.partyStoreService.createOrganization();
    }
}
