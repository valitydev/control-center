import isEqual from 'lodash-es/isEqual';

import { domain } from '@vality/org-management-proto/admin_management';

export function normalizeRoleAssignment(role: domain.RoleAssignment): domain.RoleAssignment {
    return {
        role_id: role.role_id,
        ...(role.scope?.resource_id
            ? { scope: { scope_id: role.scope.scope_id, resource_id: role.scope.resource_id } }
            : {}),
    };
}

export interface RoleDiff {
    toAdd: domain.RoleAssignment[];
    toRemove: domain.MemberRole[];
}

export function diffMemberRoles(
    initialRoles: domain.MemberRole[] | null | undefined,
    currentAssignments: domain.RoleAssignment[] | null | undefined,
): RoleDiff {
    const remainingInitial = [...(initialRoles || [])];
    const toAdd: domain.RoleAssignment[] = [];

    for (const curr of currentAssignments || []) {
        const idx = remainingInitial.findIndex((init) =>
            isEqual(normalizeRoleAssignment(init), normalizeRoleAssignment(curr)),
        );
        if (idx !== -1) {
            remainingInitial.splice(idx, 1);
        } else {
            toAdd.push(curr);
        }
    }

    return {
        toAdd,
        toRemove: remainingInitial,
    };
}
