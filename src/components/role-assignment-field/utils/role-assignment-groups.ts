import { domain } from '@vality/org-management-proto/admin_management';

import { ROLES, SCOPES, ScopeId, sortRoleIds } from '~/api/org-management';

export interface RoleAssignmentGroup {
    roleId: domain.RoleID;
    scopeId: ScopeId;
    resourceIds: string[];
}

export function toRoleAssignmentGroups(
    assignments: domain.RoleAssignment[] | null | undefined,
): RoleAssignmentGroup[] {
    if (!assignments?.length) {
        return [];
    }

    const groupsMap = new Map<string, RoleAssignmentGroup>();

    for (const assignment of assignments) {
        const roleId = assignment.role_id || sortRoleIds(Object.keys(ROLES))[0] || '';
        const rawScopeId = assignment.scope?.scope_id;
        const scopeId: ScopeId = (SCOPES as readonly string[]).includes(rawScopeId as string)
            ? (rawScopeId as ScopeId)
            : SCOPES[0];
        const resourceId = assignment.scope?.resource_id;
        const key = JSON.stringify([roleId, scopeId, !!resourceId]);

        const existing = groupsMap.get(key);
        if (existing) {
            if (resourceId && !existing.resourceIds.includes(resourceId)) {
                existing.resourceIds.push(resourceId);
            }
        } else {
            groupsMap.set(key, {
                roleId,
                scopeId,
                resourceIds: resourceId ? [resourceId] : [],
            });
        }
    }

    return Array.from(groupsMap.values());
}

export function fromRoleAssignmentGroups(
    groups: RoleAssignmentGroup[] | null | undefined,
): domain.RoleAssignment[] {
    if (!groups?.length) {
        return [];
    }

    const assignments: domain.RoleAssignment[] = [];

    for (const group of groups) {
        const resourceIds = Array.isArray(group.resourceIds)
            ? group.resourceIds.filter(Boolean)
            : group.resourceIds
              ? [group.resourceIds]
              : [];

        if (resourceIds.length > 0) {
            for (const resourceId of resourceIds) {
                assignments.push({
                    role_id: group.roleId,
                    scope: {
                        scope_id: group.scopeId,
                        resource_id: resourceId,
                    },
                });
            }
        } else {
            assignments.push({
                role_id: group.roleId,
            });
        }
    }

    return assignments;
}
