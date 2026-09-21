import { describe, expect, it } from 'vitest';

import { domain } from '@vality/org-management-proto/admin_management';

import {
    RoleAssignmentGroup,
    fromRoleAssignmentGroups,
    toRoleAssignmentGroups,
} from './role-assignment-groups';

describe('role-assignment-groups', () => {
    describe('toRoleAssignmentGroups', () => {
        it('returns empty array when assignments is empty, null or undefined', () => {
            expect(toRoleAssignmentGroups([])).toEqual([]);
            expect(toRoleAssignmentGroups(null)).toEqual([]);
            expect(toRoleAssignmentGroups(undefined)).toEqual([]);
        });

        it('maps role without scope to empty resourceIds', () => {
            const assignments: domain.RoleAssignment[] = [{ role_id: 'Administrator' }];

            expect(toRoleAssignmentGroups(assignments)).toEqual([
                {
                    roleId: 'Administrator',
                    scopeId: 'Shop',
                    resourceIds: [],
                },
            ]);
        });

        it('groups multiple assignments with the same role and scope into one group', () => {
            const assignments: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-3' } },
            ];

            expect(toRoleAssignmentGroups(assignments)).toEqual([
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['shop-1', 'shop-2', 'shop-3'],
                },
            ]);
        });

        it('separates assignments with the same role but different scopes', () => {
            const assignments: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Manager', scope: { scope_id: 'Wallet', resource_id: 'wallet-1' } },
            ];

            expect(toRoleAssignmentGroups(assignments)).toEqual([
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['shop-1'],
                },
                {
                    roleId: 'Manager',
                    scopeId: 'Wallet',
                    resourceIds: ['wallet-1'],
                },
            ]);
        });

        it('deduplicates identical resourceIds within the same group', () => {
            const assignments: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            ];

            expect(toRoleAssignmentGroups(assignments)).toEqual([
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['shop-1'],
                },
            ]);
        });

        it('preserves organization-wide and scoped assignments for the same role', () => {
            const assignments: domain.RoleAssignment[] = [
                { role_id: 'Manager' },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            ];

            const groups = toRoleAssignmentGroups(assignments);

            expect(groups).toHaveLength(2);
            expect(fromRoleAssignmentGroups(groups)).toEqual(assignments);
        });

        it('falls back to default scope when unknown scope_id is provided', () => {
            const assignments: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Unknown', resource_id: 'res-1' } },
            ];

            expect(toRoleAssignmentGroups(assignments)).toEqual([
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['res-1'],
                },
            ]);
        });
    });

    describe('fromRoleAssignmentGroups', () => {
        it('returns empty array when groups is empty, null or undefined', () => {
            expect(fromRoleAssignmentGroups([])).toEqual([]);
            expect(fromRoleAssignmentGroups(null)).toEqual([]);
            expect(fromRoleAssignmentGroups(undefined)).toEqual([]);
        });

        it('converts group with empty resourceIds to role without scope', () => {
            const groups: RoleAssignmentGroup[] = [
                { roleId: 'Administrator', scopeId: 'Shop', resourceIds: [] },
            ];

            expect(fromRoleAssignmentGroups(groups)).toEqual([{ role_id: 'Administrator' }]);
        });

        it('converts group with multiple resourceIds into individual RoleAssignment objects', () => {
            const groups: RoleAssignmentGroup[] = [
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['shop-1', 'shop-2'],
                },
            ];

            expect(fromRoleAssignmentGroups(groups)).toEqual([
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            ]);
        });

        it('handles multiple groups with mixed scoped and unscoped roles', () => {
            const groups: RoleAssignmentGroup[] = [
                {
                    roleId: 'Manager',
                    scopeId: 'Shop',
                    resourceIds: ['shop-1'],
                },
                {
                    roleId: 'Administrator',
                    scopeId: 'Shop',
                    resourceIds: [],
                },
                {
                    roleId: 'WalletManager',
                    scopeId: 'Wallet',
                    resourceIds: ['wallet-1', 'wallet-2'],
                },
            ];

            expect(fromRoleAssignmentGroups(groups)).toEqual([
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Administrator' },
                {
                    role_id: 'WalletManager',
                    scope: { scope_id: 'Wallet', resource_id: 'wallet-1' },
                },
                {
                    role_id: 'WalletManager',
                    scope: { scope_id: 'Wallet', resource_id: 'wallet-2' },
                },
            ]);
        });

        it('preserves round-trip conversion', () => {
            const initial: domain.RoleAssignment[] = [
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
                { role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
                { role_id: 'Administrator' },
            ];

            const groups = toRoleAssignmentGroups(initial);
            const restored = fromRoleAssignmentGroups(groups);

            expect(restored).toEqual(initial);
        });
    });
});
