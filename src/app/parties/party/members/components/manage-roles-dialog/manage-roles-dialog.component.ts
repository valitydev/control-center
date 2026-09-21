import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { DomainObjectType } from '@vality/domain-proto/domain';
import {
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    Option,
    observableResource,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService, ThriftRepositoryService } from '~/api/services';

import { MemberRolePanelComponent } from './member-role-panel/member-role-panel.component';
import { groupMemberRoles } from './utils/group-member-roles';

export interface ManageRolesDialogData {
    organizationId: domain.OrganizationID;
    member: domain.Member;
    partyId?: domain.PartyID;
}

@Component({
    selector: 'cc-manage-roles-dialog',
    templateUrl: './manage-roles-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DialogModule, MatButtonModule, MatExpansionModule, MemberRolePanelComponent],
})
export class ManageRolesDialogComponent extends DialogSuperclass<
    ManageRolesDialogComponent,
    ManageRolesDialogData
> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private repositoryService = inject(ThriftRepositoryService);
    private log = inject(NotifyLogService);

    roles = signal(this.dialogData.member.roles || []);
    groups = computed(() => groupMemberRoles(this.roles()));
    expandedGroup = signal<string | null>(null);
    hasChanges = signal(false);
    actionProgress = signal(0);

    member = observableResource({
        loader: () =>
            this.thriftOrgManagementService
                .GetMember(this.dialogData.organizationId, this.dialogData.member.user.id)
                .pipe(
                    catchError((err) => {
                        this.log.error(err);
                        return of({ ...this.dialogData.member, roles: this.roles() });
                    }),
                    tap((member) => this.roles.set(member.roles || [])),
                ),
    });
    shops = observableResource({ loader: () => this.loadResources(DomainObjectType.shop_config) });
    wallets = observableResource({
        loader: () => this.loadResources(DomainObjectType.wallet_config),
    });
    busy = computed(() => this.member.isLoading() || !!this.actionProgress());

    assignRole(assignment: domain.RoleAssignment): void {
        if (
            this.busy() ||
            this.roles().some(
                (role) =>
                    role.role_id === assignment.role_id &&
                    role.scope?.scope_id === assignment.scope?.scope_id &&
                    role.scope?.resource_id === assignment.scope?.resource_id,
            )
        ) {
            return;
        }
        this.thriftOrgManagementService
            .AssignMemberRole(
                this.dialogData.organizationId,
                this.dialogData.member.user.id,
                assignment,
            )
            .pipe(progressTo(this.actionProgress))
            .subscribe({
                next: (role) => {
                    this.roles.update((roles) => [...roles, role]);
                    this.expandedGroup.set(role.role_id);
                    this.hasChanges.set(true);
                    this.log.success('Role assigned');
                },
                error: (err) => this.log.error(err),
            });
    }

    removeRole(role: domain.MemberRole): void {
        if (this.busy() || !this.roles().some((assigned) => assigned.id === role.id)) {
            return;
        }
        this.thriftOrgManagementService
            .RemoveMemberRole(
                this.dialogData.organizationId,
                this.dialogData.member.user.id,
                role.id,
            )
            .pipe(progressTo(this.actionProgress))
            .subscribe({
                next: () => {
                    this.roles.update((roles) =>
                        roles.filter((assigned) => assigned.id !== role.id),
                    );
                    this.hasChanges.set(true);
                    this.log.success('Role removed');
                },
                error: (err) => this.log.error(err),
            });
    }

    closeDialog(): void {
        if (this.busy()) {
            return;
        }
        if (this.hasChanges()) {
            this.closeWithSuccess();
        } else {
            this.closeWithCancellation();
        }
    }

    private loadResources(type: DomainObjectType.shop_config | DomainObjectType.wallet_config) {
        if (!this.dialogData.partyId) {
            return of<Option<string>[]>([]);
        }
        return this.repositoryService
            .GetRelatedGraph({ ref: { party_config: { id: this.dialogData.partyId } }, type })
            .pipe(
                map(({ nodes }): Option<string>[] =>
                    Array.from(nodes, (node) => ({
                        value:
                            type === DomainObjectType.shop_config
                                ? node.ref.shop_config.id
                                : node.ref.wallet_config.id,
                        label: node.name,
                        description: node.description,
                    })),
                ),
                map((options) =>
                    options.map((option) => ({ ...option, label: option.label || option.value })),
                ),
                catchError((err) => {
                    this.log.error(err);
                    return of<Option<string>[]>([]);
                }),
            );
    }
}
