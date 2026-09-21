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
import { MemberRolesManagerComponent } from '~/components/member-roles-manager';
import { UserFieldComponent } from '~/components/user-field';

export interface AddMemberDialogData {
    organizationId: domain.OrganizationID;
    partyId?: domain.PartyID;
}

interface AddMemberModel {
    user_id: string;
    email: string;
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
        MemberRolesManagerComponent,
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
    });

    control = form(this.controlModel, (schemaPath) => {
        required(schemaPath.user_id);
        required(schemaPath.email);
        email(schemaPath.email);
    });

    roles = signal<domain.MemberRole[]>([]);
    progress = signal(0);

    onUserSelected(user: domain.User): void {
        if (user.email) {
            this.controlModel.update((model) => ({
                ...model,
                email: user.email || model.email,
            }));
        }
    }

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

    add(): void {
        const { user_id, email: memberEmail } = this.controlModel();
        const roles = this.roles();
        this.thriftOrgManagementService
            .AddMember(this.dialogData.organizationId, {
                user_id,
                email: memberEmail,
            })
            .pipe(
                switchMap((member) =>
                    roles.length
                        ? forkJoin(
                              roles.map((r) =>
                                  this.thriftOrgManagementService.AssignMemberRole(
                                      this.dialogData.organizationId,
                                      user_id,
                                      {
                                          role_id: r.role_id,
                                          ...(r.scope ? { scope: r.scope } : {}),
                                      },
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
