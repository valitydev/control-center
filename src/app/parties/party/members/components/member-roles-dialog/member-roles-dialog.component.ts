import { EMPTY, of } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';

import {
    Column,
    ConfirmDialogComponent,
    DEFAULT_DIALOG_CONFIG,
    DialogModule,
    DialogResponseStatus,
    DialogService,
    DialogSuperclass,
    NotifyLogService,
    TableModule,
    createMenuColumn,
    observableResource,
    progressTo,
} from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES } from '~/api/org-management';
import { ThriftOrganizationManagementService } from '~/api/services';
import { RoleAssignmentFieldComponent } from '~/components/role-assignment-field';

export interface MemberRolesDialogData {
    organizationId: domain.OrganizationID;
    userId: domain.UserID;
    userEmail?: string;
    partyId?: domain.PartyID;
}

@Component({
    selector: 'cc-member-roles-dialog',
    templateUrl: './member-roles-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        TableModule,
        RoleAssignmentFieldComponent,
        FormField,
    ],
})
export class MemberRolesDialogComponent extends DialogSuperclass<
    MemberRolesDialogComponent,
    MemberRolesDialogData
> {
    static override defaultDialogConfig = DEFAULT_DIALOG_CONFIG.large;

    private thriftOrgManagementService = inject(ThriftOrganizationManagementService);
    private dialogService = inject(DialogService);
    private log = inject(NotifyLogService);

    hasChanges = signal(false);
    assignProgress = signal(0);

    newRole = signal<domain.RoleAssignment>({
        role_id: Object.keys(ROLES)[0] || '',
    });

    newRoleControl = form(this.newRole, (schemaPath) => {
        required(schemaPath.role_id);
    });

    member = observableResource({
        loader: () =>
            this.thriftOrgManagementService
                .GetMember(this.dialogData.organizationId, this.dialogData.userId)
                .pipe(
                    catchError((err) => {
                        this.log.error(err);
                        return of(null);
                    }),
                ),
    });

    columns: Column<domain.MemberRole>[] = [
        {
            field: 'role_id',
            header: 'Role',
        },
        {
            field: 'scope',
            header: 'Scope',
            cell: (r) => ({
                value: r.scope
                    ? `${r.scope.scope_id}${r.scope.resource_id ? ': ' + r.scope.resource_id : ''}`
                    : 'All',
            }),
        },
        createMenuColumn((r) => ({
            items: [
                {
                    label: 'Remove role',
                    click: () => this.removeRole(r),
                },
            ],
        })),
    ];

    assign(): void {
        this.thriftOrgManagementService
            .AssignMemberRole(
                this.dialogData.organizationId,
                this.dialogData.userId,
                this.newRole(),
            )
            .pipe(progressTo(this.assignProgress))
            .subscribe({
                next: () => {
                    this.log.success('Role assigned');
                    this.hasChanges.set(true);
                    this.newRole.set({
                        role_id: Object.keys(ROLES)[0] || '',
                    });
                    this.member.reload();
                },
                error: (err) => {
                    this.log.error(err);
                },
            });
    }

    removeRole(role: domain.MemberRole): void {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Remove role "${role.role_id}"`,
                confirmLabel: 'Remove',
            })
            .afterClosed()
            .pipe(
                filter((res) => res?.status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.thriftOrgManagementService
                        .RemoveMemberRole(
                            this.dialogData.organizationId,
                            this.dialogData.userId,
                            role.id,
                        )
                        .pipe(
                            catchError((err) => {
                                this.log.error(err);
                                return EMPTY;
                            }),
                        ),
                ),
            )
            .subscribe({
                next: () => {
                    this.log.success('Role removed');
                    this.hasChanges.set(true);
                    this.member.reload();
                },
            });
    }

    closeDialog(): void {
        if (this.hasChanges()) {
            this.closeWithSuccess();
        } else {
            this.closeWithCancellation();
        }
    }
}
