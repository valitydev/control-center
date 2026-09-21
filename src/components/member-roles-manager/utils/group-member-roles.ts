import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, sortRoleIds } from '~/api/org-management';

export interface MemberRoleGroup {
    roleId: domain.RoleID;
    roles: domain.MemberRole[];
    description: string;
}

export function getRolesSummary(roles: domain.MemberRole[]): string {
    if (!roles.length) {
        return 'no roles';
    }
    const parts: string[] = [];
    if (roles.some((role) => !role.scope?.scope_id)) {
        parts.push('entire organization');
    }
    const shopsCount = roles.filter((role) => role.scope?.scope_id === 'Shop').length;
    if (shopsCount > 0) {
        parts.push(`${shopsCount} ${shopsCount === 1 ? 'shop' : 'shops'}`);
    }
    const walletsCount = roles.filter((role) => role.scope?.scope_id === 'Wallet').length;
    if (walletsCount > 0) {
        parts.push(`${walletsCount} ${walletsCount === 1 ? 'wallet' : 'wallets'}`);
    }
    const otherRoles = roles.filter(
        (role) =>
            role.scope?.scope_id &&
            role.scope.scope_id !== 'Shop' &&
            role.scope.scope_id !== 'Wallet',
    );
    if (otherRoles.length > 0) {
        parts.push(`${otherRoles.length} other`);
    }
    return parts.join(', ');
}

export function groupMemberRoles(roles: domain.MemberRole[]): MemberRoleGroup[] {
    const groups = new Map<string, { roleId: domain.RoleID; roles: domain.MemberRole[] }>(
        Object.keys(ROLES).map((roleId) => [roleId, { roleId, roles: [] }]),
    );
    for (const role of roles) {
        const group = groups.get(role.role_id);
        if (group) {
            group.roles.push(role);
        } else {
            groups.set(role.role_id, {
                roleId: role.role_id,
                roles: [role],
            });
        }
    }
    return sortRoleIds([...groups.keys()]).map((roleId) => {
        const group = groups.get(roleId)!;
        return {
            ...group,
            description: getRolesSummary(group.roles),
        };
    });
}
