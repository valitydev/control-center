import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
    selector: 'cc-members',
    templateUrl: './members.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PageLayoutModule, TableResourceComponent],
})
export class MembersComponent {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);
    private partyStoreService = inject(PartyStoreService);

    members = pagedObservableResource<domain.Member, string>({
        params: this.partyStoreService.id$,
        loader: (partyId, options) =>
            !partyId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListMembers(partyId, {
                          limit: options.size,
                          continuation_token: options.continuationToken,
                      })
                      .pipe(
                          map((res) => ({
                              result: res.members,
                              continuationToken: res.continuation_token,
                          })),
                          catchError((err) => {
                              this.log.error(err);
                              return of({ result: [] });
                          }),
                      ),
    });

    columns: Column<domain.Member>[] = [
        {
            field: 'id',
            header: 'User ID',
            cell: (m) => ({ value: m.id }),
        },
        {
            field: 'email',
            cell: (m) => ({ value: m.email || '—' }),
        },
        {
            field: 'roles',
            cell: (m) => ({
                value: (m.roles || []).map((r) => r.role_id).join(', ') || '—',
            }),
        },
    ];
}
