import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { RoleAssignmentsFieldComponent } from '~/components/role-assignment-field';

export interface CreateInvitationDialogData {
    organizationId: domain.OrganizationID;
    partyId?: domain.PartyID;
}

interface CreateInvitationModel {
    email: string;
    roles: domain.RoleAssignment[];
}

@Component({
    selector: 'cc-create-invitation-dialog',
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        InputFieldModule,
        FormField,
        RoleAssignmentsFieldComponent,
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

    progress = signal(0);

    create() {
        const { email: invitationEmail, roles } = this.controlModel();

        this.thriftOrgManagementService
            .CreateInvitation(this.dialogData.organizationId, {
                email: invitationEmail,
                roles,
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
