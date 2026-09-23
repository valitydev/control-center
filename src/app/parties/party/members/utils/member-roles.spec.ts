import { domain } from '@vality/org-management-proto/admin_management';

import {
    getGeneralRoleIds,
    getRoleIds,
    getRoleScopes,
    getWalletRoleIds,
    isWalletRole,
    sortRoleIds,
} from './member-roles';

describe('member-roles utils', () => {
    describe('sortRoleIds', () => {
        it('should sort roles according to hierarchy: Administrator > Manager > Accountant > Integrator > WalletManager', () => {
            const input = ['Integrator', 'WalletManager', 'Manager', 'Administrator', 'Accountant'];
            expect(sortRoleIds(input)).toEqual([
                'Administrator',
                'Manager',
                'Accountant',
                'Integrator',
                'WalletManager',
            ]);
        });

        it('should sort unknown roles alphabetically at the end', () => {
            const input = ['Viewer', 'Manager', 'Analyst', 'Administrator'];
            expect(sortRoleIds(input)).toEqual(['Administrator', 'Manager', 'Analyst', 'Viewer']);
        });

        it('should handle empty list', () => {
            expect(sortRoleIds([])).toEqual([]);
        });
    });

    describe('isWalletRole', () => {
        it('should return true if role_id is WalletManager', () => {
            const role: domain.MemberRole = { id: '1', role_id: 'WalletManager' };
            expect(isWalletRole(role)).toBe(true);
        });

        it('should return true if scope.scope_id is Wallet', () => {
            const role: domain.MemberRole = {
                id: '2',
                role_id: 'Manager',
                scope: { scope_id: 'Wallet', resource_id: 'w1' },
            };
            expect(isWalletRole(role)).toBe(true);
        });

        it('should return false for general roles with no scope', () => {
            const role: domain.MemberRole = { id: '3', role_id: 'Administrator' };
            expect(isWalletRole(role)).toBe(false);
        });

        it('should return false for roles with Shop scope', () => {
            const role: domain.MemberRole = {
                id: '4',
                role_id: 'Manager',
                scope: { scope_id: 'Shop', resource_id: 's1' },
            };
            expect(isWalletRole(role)).toBe(false);
        });
    });

    describe('getGeneralRoleIds', () => {
        it('should extract unique general roles and sort them by priority', () => {
            const roles: domain.MemberRole[] = [
                { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 's1' } },
                { id: '2', role_id: 'Administrator' },
                { id: '3', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 's2' } },
                { id: '4', role_id: 'WalletManager' },
            ];

            expect(getGeneralRoleIds(roles)).toEqual(['Administrator', 'Manager']);
        });

        it('should return empty array for null or undefined', () => {
            expect(getGeneralRoleIds(null)).toEqual([]);
            expect(getGeneralRoleIds(undefined)).toEqual([]);
        });
    });

    describe('getWalletRoleIds', () => {
        it('should extract unique wallet roles and sort them by priority', () => {
            const roles: domain.MemberRole[] = [
                { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 's1' } },
                { id: '2', role_id: 'Administrator' },
                {
                    id: '3',
                    role_id: 'WalletManager',
                    scope: { scope_id: 'Wallet', resource_id: 'w1' },
                },
                {
                    id: '4',
                    role_id: 'WalletManager',
                    scope: { scope_id: 'Wallet', resource_id: 'w2' },
                },
                {
                    id: '5',
                    role_id: 'Integrator',
                    scope: { scope_id: 'Wallet', resource_id: 'w1' },
                },
            ];

            expect(getWalletRoleIds(roles)).toEqual(['Integrator', 'WalletManager']);
        });

        it('should return empty array for null or undefined', () => {
            expect(getWalletRoleIds(null)).toEqual([]);
            expect(getWalletRoleIds(undefined)).toEqual([]);
        });
    });

    describe('getRoleIds', () => {
        it('should return all sorted unique role IDs when predicate is omitted', () => {
            const roles: domain.MemberRole[] = [
                { id: '1', role_id: 'Manager' },
                { id: '2', role_id: 'Administrator' },
                { id: '3', role_id: 'Manager' },
            ];
            expect(getRoleIds(roles)).toEqual(['Administrator', 'Manager']);
        });

        it('should filter roles using provided predicate', () => {
            const roles: domain.MemberRole[] = [
                { id: '1', role_id: 'Manager' },
                { id: '2', role_id: 'Administrator' },
            ];
            expect(getRoleIds(roles, (r) => r.role_id === 'Administrator')).toEqual([
                'Administrator',
            ]);
        });
    });

    describe('getRoleScopes', () => {
        it('should return only Wallet scope for WalletManager', () => {
            expect(getRoleScopes('WalletManager')).toEqual(['Wallet']);
        });

        it('should return all scopes for other roles or undefined', () => {
            expect(getRoleScopes('Manager')).toEqual(['Shop', 'Wallet']);
            expect(getRoleScopes('Administrator')).toEqual(['Shop', 'Wallet']);
            expect(getRoleScopes()).toEqual(['Shop', 'Wallet']);
        });
    });
});
