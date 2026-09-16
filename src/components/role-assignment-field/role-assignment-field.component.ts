import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
    FormField,
    FormValueControl,
    form,
    required,
    transformedValue,
} from '@angular/forms/signals';

import { Option, SelectFieldModule } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, SCOPES, ScopeId } from '~/api/org-management';
import { ShopFieldModule } from '~/components/shop-field';
import { WalletFieldModule } from '~/components/wallet-field';

export interface RoleAssignmentModel {
    roleId: domain.RoleID;
    scopeId: ScopeId;
    resourceId: string;
}

@Component({
    selector: 'cc-role-assignment-field',
    templateUrl: './role-assignment-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SelectFieldModule, ShopFieldModule, WalletFieldModule, FormField],
})
export class RoleAssignmentFieldComponent implements FormValueControl<domain.RoleAssignment> {
    partyId = input<domain.PartyID>();

    value = model<domain.RoleAssignment>({ role_id: Object.keys(ROLES)[0] || '' });

    formValue = transformedValue<domain.RoleAssignment, RoleAssignmentModel>(this.value, {
        parse: (r) => ({
            value: {
                role_id: r.roleId,
                ...(r.resourceId
                    ? { scope: { scope_id: r.scopeId, resource_id: r.resourceId } }
                    : {}),
            },
        }),
        format: (r) => ({
            roleId: r?.role_id || Object.keys(ROLES)[0] || '',
            scopeId: (SCOPES as readonly string[]).includes(r?.scope?.scope_id as string)
                ? (r?.scope?.scope_id as ScopeId)
                : SCOPES[0],
            resourceId: r?.scope?.resource_id || '',
        }),
    });

    control = form(this.formValue, (schemaPath) => {
        required(schemaPath.roleId);
    });

    rolesOptions: Option<domain.RoleID>[] = Object.keys(ROLES).map((key) => ({
        label: key,
        value: key,
    }));

    scopeOptions: Option<ScopeId>[] = SCOPES.map((scope) => ({
        label: scope,
        value: scope,
    }));

    changeScope(): void {
        this.control.resourceId().value.set('');
    }
}
