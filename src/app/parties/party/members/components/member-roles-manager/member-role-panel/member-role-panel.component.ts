import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormField, disabled, form } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { Option, SelectFieldModule } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { SCOPES, ScopeId } from '~/api/org-management';

@Component({
    selector: 'cc-member-role-panel',
    templateUrl: './member-role-panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormField, MatButtonModule, MatDividerModule, MatIconModule, SelectFieldModule],
})
export class MemberRolePanelComponent {
    roleId = input.required<domain.RoleID>();
    roles = input.required<domain.MemberRole[]>();
    shops = input<Option<string>[]>([]);
    wallets = input<Option<string>[]>([]);
    shopsLoading = input(false);
    walletsLoading = input(false);
    disabled = input(false);
    assign = output<domain.RoleAssignment>();
    remove = output<domain.MemberRole>();

    newRole = signal({ scopeId: SCOPES[0] as ScopeId, resourceId: '' });
    control = form(this.newRole, (path) => disabled(path, () => this.disabled()));
    scopeOptions = SCOPES.map((scopeId) => ({ label: scopeId, value: scopeId }));
    request = computed<domain.RoleAssignment>(() => {
        const { scopeId, resourceId } = this.newRole();
        return {
            role_id: this.roleId(),
            ...(resourceId ? { scope: { scope_id: scopeId, resource_id: resourceId } } : {}),
        };
    });
    hasEntireOrg = computed(() => this.roles().some((role) => !role.scope?.scope_id));
    availableShops = computed(() => {
        const assignedShopIds = new Set(
            this.roles()
                .filter((role) => role.scope?.scope_id === 'Shop' && role.scope?.resource_id)
                .map((role) => role.scope.resource_id),
        );
        return this.shops().filter((option) => !assignedShopIds.has(option.value));
    });
    availableWallets = computed(() => {
        const assignedWalletIds = new Set(
            this.roles()
                .filter((role) => role.scope?.scope_id === 'Wallet' && role.scope?.resource_id)
                .map((role) => role.scope.resource_id),
        );
        return this.wallets().filter((option) => !assignedWalletIds.has(option.value));
    });
    alreadyAssigned = computed(() =>
        this.roles().some(
            (role) =>
                (role.scope?.scope_id || '') === (this.request().scope?.scope_id || '') &&
                (role.scope?.resource_id || '') === (this.request().scope?.resource_id || ''),
        ),
    );
    sections = computed(() => {
        const scopes = new Set([
            '',
            ...SCOPES,
            ...this.roles().map((role) => role.scope?.scope_id || ''),
        ]);
        return [...scopes]
            .map((scopeId) => ({
                scopeId,
                label: scopeId === 'Shop' ? 'Shops' : scopeId === 'Wallet' ? 'Wallets' : scopeId,
                roles: this.roles().filter((role) => (role.scope?.scope_id || '') === scopeId),
            }))
            .filter((section) => section.roles.length);
    });

    resourceName(role: domain.MemberRole): string {
        const options =
            role.scope?.scope_id === 'Shop'
                ? this.shops()
                : role.scope?.scope_id === 'Wallet'
                  ? this.wallets()
                  : [];
        return (
            options.find((option) => option.value === role.scope?.resource_id)?.label ||
            role.scope?.resource_id ||
            role.scope?.scope_id ||
            'Entire organization'
        );
    }

    changeScope(): void {
        this.newRole.update((role) => ({ ...role, resourceId: '' }));
    }

    submitAssignment(): void {
        if (!this.disabled() && !this.alreadyAssigned()) {
            this.assign.emit(this.request());
        }
    }
}
