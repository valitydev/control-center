import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormField, FormValueControl, applyEach, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES } from '~/api/org-management';

import { RoleAssignmentFieldComponent } from './role-assignment-field.component';

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

    control = form(this.value, (schemaPath) => {
        applyEach(schemaPath, (rolePath) => {
            required(rolePath.role_id);
        });
    });

    addRole(): void {
        const firstRole = Object.keys(ROLES)[0] || '';
        this.value.update((roles) => [...(roles || []), { role_id: firstRole }]);
    }

    removeRole(index: number): void {
        this.value.update((roles) => (roles || []).filter((_, i) => i !== index));
    }
}
