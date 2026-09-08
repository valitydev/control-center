import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import {
    Column,
    NotifyLogService,
    TableResourceComponent,
    pagedObservableResource,
} from '@vality/matez';
import { ListInvitationsRequest, domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';

import { PartyStoreService } from '../party-store.service';

@Component({
    selector: 'cc-invitations',
    templateUrl: './invitations.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageLayoutModule, TableResourceComponent],
})
export class InvitationsComponent {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private partyStoreService = inject(PartyStoreService);

    invitations = pagedObservableResource<
        domain.Invitation,
        { partyId: string } & Omit<ListInvitationsRequest, 'limit' | 'continuation_token'>
    >({
        params: this.partyStoreService.id$.pipe(map((partyId) => ({ partyId }))),
        loader: ({ partyId, ...params }, options) =>
            !partyId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListInvitations(partyId, {
                          limit: options.size,
                          continuation_token: options.continuationToken,
                          ...params,
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
}
