import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, applyEach, form, required } from '@angular/forms/signals';
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
import { RoleAssignmentsFieldComponent } from '~/components/role-assignment-field';

export interface ManageRolesDialogData {
    organizationId: domain.OrganizationID;
    userId: domain.UserID;
    userEmail?: string;
    partyId?: domain.PartyID;
    roles?: domain.MemberRole[];
}

function isRoleEqual(
    a: { role_id: domain.RoleID; scope?: domain.RoleScope },
    b: { role_id: domain.RoleID; scope?: domain.RoleScope },
): boolean {
    if (a.role_id !== b.role_id) {
        return false;
    }
    const aScopeId = a.scope?.scope_id;
    const bScopeId = b.scope?.scope_id;
    const aResourceId = a.scope?.resource_id || '';
    const bResourceId = b.scope?.resource_id || '';

    if (!aScopeId && !bScopeId) {
        return true;
    }
    return aScopeId === bScopeId && aResourceId === bResourceId;
}

@Component({
    selector: 'cc-manage-roles-dialog',
    templateUrl: './manage-roles-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        RoleAssignmentsFieldComponent,
        FormField,
    ],
})
export class ManageRolesDialogComponent extends DialogSuperclass<
    ManageRolesDialogComponent,
    ManageRolesDialogData
> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    private initialMemberRoles: domain.MemberRole[] = this.dialogData.roles || [];

    progress = signal(0);

    roles = signal<domain.RoleAssignment[]>(
        (this.dialogData.roles || []).map((r) => ({
            role_id: r.role_id,
            scope: r.scope,
        })),
    );

    control = form(this.roles, (schemaPath) => {
        applyEach(schemaPath, (rolePath) => {
            required(rolePath.role_id);
        });
    });

    member = observableResource({
        loader: () =>
            this.thriftOrgManagementService
                .GetMember(this.dialogData.organizationId, this.dialogData.userId)
                .pipe(
                    tap((member) => {
                        if (member) {
                            this.initialMemberRoles = member.roles || [];
                            this.roles.set(
                                (member.roles || []).map((r) => ({
                                    role_id: r.role_id,
                                    scope: r.scope,
                                })),
                            );
                        }
                    }),
                    catchError((err) => {
                        this.log.error(err);
                        return of(null);
                    }),
                ),
    });

    save(): void {
        const currentAssignments = this.roles();
        const remainingInitial = [...this.initialMemberRoles];
        const toAdd: domain.RoleAssignment[] = [];

        for (const curr of currentAssignments) {
            const idx = remainingInitial.findIndex((init) => isRoleEqual(init, curr));
            if (idx !== -1) {
                remainingInitial.splice(idx, 1);
            } else {
                toAdd.push(curr);
            }
        }
        const toRemove = remainingInitial;

        const calls: Observable<unknown>[] = [
            ...toRemove.map((r) =>
                this.thriftOrgManagementService.RemoveMemberRole(
                    this.dialogData.organizationId,
                    this.dialogData.userId,
                    r.id,
                ),
            ),
            ...toAdd.map((r) =>
                this.thriftOrgManagementService.AssignMemberRole(
                    this.dialogData.organizationId,
                    this.dialogData.userId,
                    r,
                ),
            ),
        ];

        if (calls.length === 0) {
            this.closeWithSuccess();
            return;
        }

        forkJoin(calls)
            .pipe(progressTo(this.progress))
            .subscribe({
                next: () => {
                    this.log.success('Roles updated');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                    this.member.reload();
                },
            });
    }
}
