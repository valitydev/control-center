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

import { Option, SelectFieldModule } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES } from '~/api/org-management';
import { ShopFieldModule } from '~/components/shop-field';
import { WalletFieldModule } from '~/components/wallet-field';

export interface RoleAssignmentModel {
    roleId: domain.RoleID;
    scopeId: 'Shop' | 'Wallet';
    resourceId: string;
}

@Component({
    selector: 'cc-role-assignments-field',
    templateUrl: './role-assignments-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        SelectFieldModule,
        ShopFieldModule,
        WalletFieldModule,
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
                ...(r.resourceId
                    ? { scope: { scope_id: r.scopeId, resource_id: r.resourceId } }
                    : {}),
            })),
        }),
        format: (roles) =>
            (roles || []).map((r) => ({
                roleId: r.role_id,
                scopeId: r.scope?.scope_id === 'Wallet' ? 'Wallet' : 'Shop',
                resourceId: r.scope?.resource_id || '',
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

    scopeOptions: Option<RoleAssignmentModel['scopeId']>[] = [
        { label: 'Shop', value: 'Shop' },
        { label: 'Wallet', value: 'Wallet' },
    ];

    changeScope(index: number) {
        this.control[index].resourceId().value.set('');
    }

    addRole() {
        const firstRole = this.rolesOptions[0]?.value || '';
        this.formValue.update((roles) => [
            ...(roles || []),
            { roleId: firstRole, scopeId: 'Shop', resourceId: '' },
        ]);
    }

    removeRole(index: number) {
        this.formValue.update((roles) => (roles || []).filter((_, i) => i !== index));
    }
}
