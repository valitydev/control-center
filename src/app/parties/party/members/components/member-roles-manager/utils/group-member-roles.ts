import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, sortRoleIds } from '~/api/org-management';

export interface MemberRoleGroup {
    roleId: domain.RoleID;
    roles: domain.MemberRole[];
}

export function groupMemberRoles(roles: domain.MemberRole[]): MemberRoleGroup[] {
    const groups = new Map<string, MemberRoleGroup>(
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
    return sortRoleIds([...groups.keys()]).map((roleId) => groups.get(roleId));
}
