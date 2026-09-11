import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    NotifyLogService,
    Option,
    SelectFieldModule,
    observableResource,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ThriftOrganizationManagementService } from '~/api/services';

export interface CreateInvitationDialogData {
    organizationId: domain.OrganizationID;
}

interface CreateInvitationModel {
    email: string;
    roles: domain.RoleID[];
}

@Component({
    selector: 'cc-create-invitation-dialog',
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        InputFieldModule,
        SelectFieldModule,
        FormField,
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
        roles: [],
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.email);
        email(schemaPath.email);
    });

    roles = observableResource<domain.OrganizationRole[]>({
        loader: () =>
            this.thriftOrgManagementService.ListOrganizationRoles(this.dialogData.organizationId),
    });

    rolesOptions = computed<Option<domain.RoleID>[]>(() =>
        (this.roles.value() || []).map((r) => ({
            label: r.name || r.id,
            value: r.id,
        })),
    );

    progress = signal(0);

    create() {
        const { email: invitationEmail, roles } = this.controlModel();
        this.thriftOrgManagementService
            .CreateInvitation(this.dialogData.organizationId, {
                email: invitationEmail,
                roles: roles.map((role_id) => ({ role_id })),
            })
            .pipe(progressTo(this.progress))
            .subscribe({
                next: () => {
                    this.log.success('Invitation created');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
