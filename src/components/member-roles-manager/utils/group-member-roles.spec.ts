import { domain } from '@vality/org-management-proto/admin_management';

import { getRolesSummary, groupMemberRoles } from './group-member-roles';

describe('groupMemberRoles and getRolesSummary', () => {
    it('returns "no roles" when no roles are assigned', () => {
        expect(getRolesSummary([])).toBe('no roles');
    });

    it('returns "entire organization" for organization-wide assignment', () => {
        const roles: domain.MemberRole[] = [{ id: '1', role_id: 'Administrator' }];
        expect(getRolesSummary(roles)).toBe('entire organization');
    });

    it('returns singular "1 shop" for a single shop', () => {
        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
        ];
        expect(getRolesSummary(roles)).toBe('1 shop');
    });

    it('returns plural "2 shops" for multiple shops', () => {
        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            { id: '2', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
        ];
        expect(getRolesSummary(roles)).toBe('2 shops');
    });

    it('returns singular "1 wallet" and plural "2 wallets"', () => {
        const single: domain.MemberRole[] = [
            {
                id: '1',
                role_id: 'Wallet Manager',
                scope: { scope_id: 'Wallet', resource_id: 'wallet-1' },
            },
        ];
        expect(getRolesSummary(single)).toBe('1 wallet');

        const multiple: domain.MemberRole[] = [
            ...single,
            {
                id: '2',
                role_id: 'Wallet Manager',
                scope: { scope_id: 'Wallet', resource_id: 'wallet-2' },
            },
        ];
        expect(getRolesSummary(multiple)).toBe('2 wallets');
    });

    it('combines shops and wallets with comma separation', () => {
        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
            { id: '2', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-2' } },
            { id: '3', role_id: 'Manager', scope: { scope_id: 'Wallet', resource_id: 'w-1' } },
        ];
        expect(getRolesSummary(roles)).toBe('2 shops, 1 wallet');
    });

    it('combines entire organization and resource assignments if present', () => {
        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager' },
            { id: '2', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
        ];
        expect(getRolesSummary(roles)).toBe('entire organization, 1 shop');
    });

    it('populates description in groupMemberRoles', () => {
        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Administrator' },
            { id: '2', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 'shop-1' } },
        ];
        const groups = groupMemberRoles(roles);
        const adminGroup = groups.find((g) => g.roleId === 'Administrator');
        const managerGroup = groups.find((g) => g.roleId === 'Manager');
        const accountantGroup = groups.find((g) => g.roleId === 'Accountant');

        expect(adminGroup?.description).toBe('entire organization');
        expect(managerGroup?.description).toBe('1 shop');
        expect(accountantGroup?.description).toBe('no roles');
    });
});
