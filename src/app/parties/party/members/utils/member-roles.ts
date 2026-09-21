import uniq from 'lodash-es/uniq';

import { domain } from '@vality/org-management-proto/admin_management';

import { ROLE_PRIORITY, sortRoleIds } from '~/api/org-management';

export { ROLE_PRIORITY, sortRoleIds };

export function isWalletRole(role: domain.MemberRole): boolean {
    return role.scope?.scope_id === 'Wallet' || role.role_id === 'WalletManager';
}

export function getRoleIds(
    roles: domain.MemberRole[] | null | undefined,
    predicate?: (role: domain.MemberRole) => boolean,
): string[] {
    const filtered = (roles || [])
        .filter((r) => (predicate ? predicate(r) : true))
        .map((r) => r.role_id)
        .filter(Boolean);
    return sortRoleIds(uniq(filtered));
}

export function getGeneralRoleIds(roles: domain.MemberRole[] | null | undefined): string[] {
    return getRoleIds(roles, (r) => !isWalletRole(r));
}

export function getWalletRoleIds(roles: domain.MemberRole[] | null | undefined): string[] {
    return getRoleIds(roles, isWalletRole);
}
