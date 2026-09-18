import { Observable, forkJoin } from 'rxjs';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, applyEach, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import { DialogModule, DialogSuperclass, NotifyLogService, progressTo } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { RoleAssignmentsFieldComponent } from '~/components/role-assignment-field';

import { diffMemberRoles } from './utils';

export interface ManageRolesDialogData {
    organizationId: domain.OrganizationID;
    member: domain.Member;
    partyId?: domain.PartyID;
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

    private initialMemberRoles = this.dialogData.member.roles || [];

    progress = signal(0);

    roles = signal<domain.RoleAssignment[]>(
        this.initialMemberRoles.map((r) => ({
            role_id: r.role_id,
            scope: r.scope,
        })),
    );

    control = form(this.roles, (schemaPath) => {
        applyEach(schemaPath, (rolePath) => {
            required(rolePath.role_id);
        });
    });

    save(): void {
        const { toAdd, toRemove } = diffMemberRoles(this.initialMemberRoles, this.roles());

        const calls: Observable<unknown>[] = [
            ...toRemove.map((r) =>
                this.thriftOrgManagementService.RemoveMemberRole(
                    this.dialogData.organizationId,
                    this.dialogData.member.user.id,
                    r.id,
                ),
            ),
            ...toAdd.map((r) =>
                this.thriftOrgManagementService.AssignMemberRole(
                    this.dialogData.organizationId,
                    this.dialogData.member.user.id,
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
                },
            });
    }
}
