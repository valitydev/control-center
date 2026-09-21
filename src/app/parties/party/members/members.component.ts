import { EMPTY, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
    Column,
    ConfirmDialogComponent,
    DialogResponseStatus,
    DialogService,
    NotifyLogService,
    TableResourceComponent,
    createMenuColumn,
    pagedObservableResource,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { PageLayoutModule } from '~/components/page-layout';
import { createRolesColumn, createWalletRolesColumn } from '~/utils';

import { PartyStoreService } from '../party-store.service';

import { AddMemberDialogComponent } from './components/add-member-dialog';
import { ManageRolesDialogComponent } from './components/manage-roles-dialog';

@Component({
    selector: 'cc-members',
    templateUrl: './members.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, PageLayoutModule, TableResourceComponent],
})
export class MembersComponent {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private dialogService = inject(DialogService);
    private log = inject(NotifyLogService);
    private partyStoreService = inject(PartyStoreService);

    organization = this.partyStoreService.organization;
    organizationNotFound = this.partyStoreService.organizationNotFound;

    members = pagedObservableResource<domain.Member, string>({
        params: computed(() => this.organization.value()?.id),
        loader: (orgId, options) =>
            !orgId
                ? of({ result: [] })
                : this.thriftOrgManagementService
                      .ListMembers(orgId, {
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
            cell: (m) => ({ value: m.user.id }),
        },
        {
            field: 'email',
            cell: (m) => ({ value: m.user.email }),
        },
        createRolesColumn((m) => ({
            roles: m.roles,
            click: () => this.manageRoles(m),
        })),
        createWalletRolesColumn((m) => ({
            roles: m.roles,
            click: () => this.manageRoles(m),
        })),

        createMenuColumn((m) => ({
            items: [
                {
                    label: 'Manage roles',
                    click: () => this.manageRoles(m),
                },
                {
                    label: 'Remove member',
                    click: () => this.removeMember(m),
                },
            ],
        })),
    ];

    addMember(): void {
        const org = this.organization.value();
        if (!org?.id) return;
        this.dialogService
            .open(AddMemberDialogComponent, {
                organizationId: org.id,
                partyId: org.party_id,
            })
            .afterClosed()
            .pipe(filter((res) => res?.status === DialogResponseStatus.Success))
            .subscribe(() => {
                this.members.reload();
            });
    }

    manageRoles(member: domain.Member): void {
        const org = this.organization.value();
        if (!org?.id) return;
        this.dialogService
            .open(ManageRolesDialogComponent, {
                organizationId: org.id,
                member,
                partyId: org.party_id,
            })
            .afterClosed()
            .subscribe(() => {
                this.members.reload();
            });
    }

    removeMember(member: domain.Member): void {
        const orgId = this.organization.value()?.id;
        if (!orgId) return;
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Remove member ${member.user.email || member.user.id}`,
                confirmLabel: 'Remove',
            })
            .afterClosed()
            .pipe(
                filter((res) => res?.status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.thriftOrgManagementService.RemoveMember(orgId, member.user.id).pipe(
                        catchError((err) => {
                            this.log.error(err);
                            return EMPTY;
                        }),
                    ),
                ),
            )
            .subscribe(() => {
                this.log.success('Member removed');
                this.members.reload();
            });
    }

    createOrganization(): void {
        this.partyStoreService.createOrganization();
    }
}
