import uniq from 'lodash-es/uniq';

import { domain } from '@vality/org-management-proto/admin_management';

import { ROLE_PRIORITY, sortRoleIds } from '../constants';
import { SCOPES, ScopeId } from '../types';

export { ROLE_PRIORITY, sortRoleIds };

export interface RoleLike {
    role_id?: string;
    scope?: domain.RoleScope;
}

export function getRoleScopes(roleId?: string): readonly ScopeId[] {
    return roleId === 'WalletManager' ? ['Wallet'] : SCOPES;
}

export function isWalletRole(role: RoleLike): boolean {
    return role.scope?.scope_id === 'Wallet' || role.role_id === 'WalletManager';
}

export function getRoleIds(
    roles: RoleLike[] | null | undefined,
    predicate?: (role: RoleLike) => boolean,
): string[] {
    const filtered = (roles || [])
        .filter((r) => (predicate ? predicate(r) : true))
        .map((r) => r.role_id)
        .filter((id): id is string => Boolean(id));
    return sortRoleIds(uniq(filtered));
}

export function getGeneralRoleIds(roles: RoleLike[] | null | undefined): string[] {
    return getRoleIds(roles, (r) => !isWalletRole(r));
}

export function getWalletRoleIds(roles: RoleLike[] | null | undefined): string[] {
    return getRoleIds(roles, isWalletRole);
}
