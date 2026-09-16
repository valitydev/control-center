import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

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
import { RoleAssignmentsFieldComponent } from '~/components/role-assignment-field';
import { UserFieldComponent } from '~/components/user-field';

export interface AddMemberDialogData {
    organizationId: domain.OrganizationID;
    partyId?: domain.PartyID;
}

interface AddMemberModel {
    user_id: string;
    email: string;
    roles: domain.RoleAssignment[];
}

@Component({
    selector: 'cc-add-member-dialog',
    templateUrl: './add-member-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        InputFieldModule,
        UserFieldComponent,
        RoleAssignmentsFieldComponent,
        FormField,
    ],
})
export class AddMemberDialogComponent extends DialogSuperclass<
    AddMemberDialogComponent,
    AddMemberDialogData
> {
    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private log = inject(NotifyLogService);

    controlModel = signal<AddMemberModel>({
        user_id: '',
        email: '',
        roles: [],
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.user_id);
        required(schemaPath.email);
        email(schemaPath.email);
    });

    progress = signal(0);

    onUserSelected(user: domain.User): void {
        if (user.email) {
            this.controlModel.update((model) => ({
                ...model,
                email: user.email || model.email,
            }));
        }
    }

    add(): void {
        const { user_id, email: memberEmail, roles } = this.controlModel();
        this.thriftOrgManagementService
            .AddMember(this.dialogData.organizationId, {
                user_id,
                email: memberEmail,
            })
            .pipe(
                switchMap((member) =>
                    roles?.length
                        ? forkJoin(
                              roles.map((r) =>
                                  this.thriftOrgManagementService.AssignMemberRole(
                                      this.dialogData.organizationId,
                                      user_id,
                                      r,
                                  ),
                              ),
                          ).pipe(map(() => member))
                        : of(member),
                ),
                progressTo(this.progress),
            )
            .subscribe({
                next: () => {
                    this.log.success('Member added');
                    this.closeWithSuccess();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }
}
