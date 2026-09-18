import { describe, expect, it } from 'vitest';

import { domain } from '@vality/org-management-proto/admin_management';

import { diffMemberRoles, normalizeRoleAssignment } from './diff-roles';

describe('diff-roles', () => {
    describe('normalizeRoleAssignment', () => {
        it('omits scope if resource_id is missing', () => {
            const role: domain.RoleAssignment = {
                role_id: 'Manager',
                scope: { scope_id: 'Shop' },
            };

            expect(normalizeRoleAssignment(role)).toEqual({
                role_id: 'Manager',
            });
        });

        it('preserves scope if resource_id is present', () => {
            const role: domain.RoleAssignment = {
                role_id: 'Manager',
                scope: { scope_id: 'Shop', resource_id: 'shop-1' },
            };

            expect(normalizeRoleAssignment(role)).toEqual({
                role_id: 'Manager',
                scope: { scope_id: 'Shop', resource_id: 'shop-1' },
            });
        });
    });

    describe('diffMemberRoles', () => {
        it('returns empty toAdd and toRemove when both lists are empty', () => {
            expect(diffMemberRoles([], [])).toEqual({ toAdd: [], toRemove: [] });
            expect(diffMemberRoles(null, null)).toEqual({ toAdd: [], toRemove: [] });
            expect(diffMemberRoles(undefined, undefined)).toEqual({ toAdd: [], toRemove: [] });
        });

        it('returns empty toAdd and toRemove when roles are identical', () => {
            const initial: domain.MemberRole[] = [
                {
                    id: 'role-1',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
                { id: 'role-2', role_id: 'Administrator' },
            ];
            const current: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Administrator' },
            ];

            const result = diffMemberRoles(initial, current);

            expect(result.toAdd).toEqual([]);
            expect(result.toRemove).toEqual([]);
        });

        it('detects newly added roles', () => {
            const initial: domain.MemberRole[] = [
                {
                    id: 'role-1',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
            ];
            const current: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Administrator' },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            ];

            const result = diffMemberRoles(initial, current);

            expect(result.toAdd).toEqual([
                { role_id: 'Administrator' },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            ]);
            expect(result.toRemove).toEqual([]);
        });

        it('detects removed roles with their IDs', () => {
            const initial: domain.MemberRole[] = [
                {
                    id: 'role-1',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
                {
                    id: 'role-2',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-2' },
                },
                { id: 'role-3', role_id: 'Administrator' },
            ];
            const current: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            ];

            const result = diffMemberRoles(initial, current);

            expect(result.toAdd).toEqual([]);
            expect(result.toRemove).toEqual([
                {
                    id: 'role-2',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-2' },
                },
                { id: 'role-3', role_id: 'Administrator' },
            ]);
        });

        it('correctly handles replacing one resource with another', () => {
            const initial: domain.MemberRole[] = [
                {
                    id: 'role-1',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
            ];
            const current: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            ];

            const result = diffMemberRoles(initial, current);

            expect(result.toAdd).toEqual([
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            ]);
            expect(result.toRemove).toEqual([
                {
                    id: 'role-1',
                    role_id: 'Manager',
                    scope: { scope_id: 'Shop', resource_id: 'shop-1' },
                },
            ]);
        });
    });
});
