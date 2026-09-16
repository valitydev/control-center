import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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

import { Option, SelectFieldModule } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES } from '~/api/org-management';
import { ShopFieldModule } from '~/components/shop-field';

export interface RoleAssignmentModel {
    roleId: domain.RoleID;
    shopId: string;
}

@Component({
    selector: 'cc-role-assignments-field',
    templateUrl: './role-assignments-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        SelectFieldModule,
        ShopFieldModule,
        FormField,
    ],
})
export class RoleAssignmentsFieldComponent implements FormValueControl<domain.RoleAssignment[]> {
    partyId = input<domain.PartyID>();

    value = model<domain.RoleAssignment[]>([]);

    formValue = transformedValue<domain.RoleAssignment[], RoleAssignmentModel[]>(this.value, {
        parse: (roles) => ({
            value: (roles || []).map((r) => ({
                role_id: r.roleId,
                scope: r.shopId
                    ? {
                          scope_id: 'Shop',
                          resource_id: r.shopId,
                      }
                    : undefined,
            })),
        }),
        format: (roles) =>
            (roles || []).map((r) => ({
                roleId: r.role_id,
                shopId: r.scope?.scope_id === 'Shop' ? r.scope.resource_id || '' : '',
            })),
    });

    control = form(this.formValue, (schemaPath) => {
        applyEach(schemaPath, (rolePath) => {
            required(rolePath.roleId);
        });
    });

    rolesOptions: Option<domain.RoleID>[] = Object.keys(ROLES).map((key) => ({
        label: key,
        value: key,
    }));

    addRole() {
        const firstRole = this.rolesOptions[0]?.value || '';
        this.formValue.update((roles) => [...(roles || []), { roleId: firstRole, shopId: '' }]);
    }

    removeRole(index: number) {
        this.formValue.update((roles) => (roles || []).filter((_, i) => i !== index));
    }
}
