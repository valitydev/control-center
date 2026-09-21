import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { DialogModule, DialogSuperclass } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { MemberRolesManagerComponent } from '~/components/member-roles-manager';

export interface ViewRolesDialogData {
    email: string;
    roles: (domain.MemberRole | domain.RoleAssignment)[];
    partyId?: domain.PartyID;
}

@Component({
    selector: 'cc-view-roles-dialog',
    templateUrl: './view-roles-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DialogModule, MatButtonModule, MemberRolesManagerComponent],
})
export class ViewRolesDialogComponent extends DialogSuperclass<
    ViewRolesDialogComponent,
    ViewRolesDialogData
> {
    roles = signal(this.dialogData.roles || []);
    expandedRole = signal<string | null>(this.firstAssignedRoleId);

    private get firstAssignedRoleId(): string | null {
        const first = (this.dialogData.roles || [])[0];
        return first?.role_id ?? null;
    }

    closeDialog(): void {
        this.closeWithSuccess();
    }
}
