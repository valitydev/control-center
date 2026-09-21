import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
    DialogModule,
    DialogSuperclass,
    NotifyLogService,
    observableResource,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { MemberRolesManagerComponent } from '~/components/member-roles-manager';

export interface ManageRolesDialogData {
    organizationId: domain.OrganizationID;
    member: domain.Member;
    partyId?: domain.PartyID;
}

@Component({
    selector: 'cc-manage-roles-dialog',
    templateUrl: './manage-roles-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DialogModule, MatButtonModule, MemberRolesManagerComponent],
})
export class ManageRolesDialogComponent extends DialogSuperclass<
    ManageRolesDialogComponent,
    ManageRolesDialogData
> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    roles = signal(this.dialogData.member.roles || []);
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
}
