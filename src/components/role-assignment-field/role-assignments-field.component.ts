import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
    FormField,
    FormValueControl,
    applyEach,
    form,
    required,
    transformedValue,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, SCOPES } from '~/api/org-management';

import { RoleAssignmentFieldComponent } from './role-assignment-field.component';
import { RoleAssignmentGroup, fromRoleAssignmentGroups, toRoleAssignmentGroups } from './utils';

@Component({
    selector: 'cc-role-assignments-field',
    templateUrl: './role-assignments-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        RoleAssignmentFieldComponent,
        FormField,
    ],
})
export class RoleAssignmentsFieldComponent implements FormValueControl<domain.RoleAssignment[]> {
    partyId = input<domain.PartyID>();

    value = model<domain.RoleAssignment[]>([]);

    groups = transformedValue<domain.RoleAssignment[], RoleAssignmentGroup[]>(this.value, {
        parse: (groups) => ({ value: fromRoleAssignmentGroups(groups) }),
        format: (assignments) => toRoleAssignmentGroups(assignments),
    });

    control = form(this.groups, (schemaPath) => {
        applyEach(schemaPath, (groupPath) => {
            required(groupPath.roleId);
        });
    });

    addRole(): void {
        const firstRole = Object.keys(ROLES)[0] || '';
        this.groups.update((groups) => [
            ...(groups || []),
            { roleId: firstRole, scopeId: SCOPES[0], resourceIds: [] },
        ]);
    }

    removeRole(index: number): void {
        this.groups.update((groups) => (groups || []).filter((_, i) => i !== index));
    }
}
