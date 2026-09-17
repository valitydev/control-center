import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormField, FormValueControl, form, required } from '@angular/forms/signals';

import { Option, SelectFieldModule } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, SCOPES, ScopeId } from '~/api/org-management';
import { ShopFieldModule } from '~/components/shop-field';
import { WalletFieldModule } from '~/components/wallet-field';

import { RoleAssignmentGroup } from './utils';

@Component({
    selector: 'cc-role-assignment-field',
    templateUrl: './role-assignment-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SelectFieldModule, ShopFieldModule, WalletFieldModule, FormField],
})
export class RoleAssignmentFieldComponent implements FormValueControl<RoleAssignmentGroup> {
    partyId = input<domain.PartyID>();

    value = model<RoleAssignmentGroup>({
        roleId: Object.keys(ROLES)[0] || '',
        scopeId: SCOPES[0],
        resourceIds: [],
    });

    control = form(this.value, (schemaPath) => {
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
        this.control.resourceIds().value.set([]);
    }
}
