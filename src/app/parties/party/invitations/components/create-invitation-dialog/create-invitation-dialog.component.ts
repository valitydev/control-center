import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';
import { MemberRolesManagerComponent } from '~/components/member-roles-manager';

export interface CreateInvitationDialogData {
    organizationId: domain.OrganizationID;
    partyId?: domain.PartyID;
}

interface CreateInvitationModel {
    email: string;
}

@Component({
    selector: 'cc-create-invitation-dialog',
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        InputFieldModule,
        FormField,
        MemberRolesManagerComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './create-invitation-dialog.component.html',
})
export class CreateInvitationDialogComponent extends DialogSuperclass<
    CreateInvitationDialogComponent,
    CreateInvitationDialogData
> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    controlModel = signal<CreateInvitationModel>({
        email: '',
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.email);
        email(schemaPath.email);
    });

    roles = signal<domain.MemberRole[]>([]);
    progress = signal(0);

    assignRole(assignment: domain.RoleAssignment): void {
        if (
            this.roles().some(
                (role) =>
                    role.role_id === assignment.role_id &&
                    role.scope?.scope_id === assignment.scope?.scope_id &&
                    role.scope?.resource_id === assignment.scope?.resource_id,
            )
        ) {
            return;
        }
        this.roles.update((roles) => [...roles, { id: crypto.randomUUID(), ...assignment }]);
    }

    removeRole(role: domain.MemberRole): void {
        this.roles.update((roles) => roles.filter((assigned) => assigned.id !== role.id));
    }

    create(): void {
        const { email: invitationEmail } = this.controlModel();
        const roles: domain.RoleAssignment[] = this.roles().map((role) => ({
            role_id: role.role_id,
            ...(role.scope ? { scope: role.scope } : {}),
        }));

        this.thriftOrgManagementService
            .CreateInvitation(this.dialogData.organizationId, {
                email: invitationEmail,
                roles,
            })
            .pipe(progressTo(this.progress))
            .subscribe({
                next: () => {
                    this.log.success('Invitation sent');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
