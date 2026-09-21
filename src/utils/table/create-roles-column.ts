import { Value, createColumn } from '@vality/matez';

import { RoleLike, getGeneralRoleIds, getWalletRoleIds } from '~/api/org-management';

export interface RolesColumnParams {
    roles: RoleLike[] | null | undefined;
    click?: Value['click'];
}

export const createRolesColumn = createColumn(
    ({ roles, click }: RolesColumnParams) => {
        const roleIds = getGeneralRoleIds(roles);
        const str = roleIds.join(', ') || '—';
        return {
            value: str,
            tooltip: str,
            ...(click ? { click } : {}),
        };
    },
    { field: 'roles', header: 'Roles' },
);

export const createWalletRolesColumn = createColumn(
    ({ roles, click }: RolesColumnParams) => {
        const roleIds = getWalletRoleIds(roles);
        const str = roleIds.join(', ') || '—';
        return {
            value: str,
            tooltip: str,
            ...(click ? { click } : {}),
        };
    },
    { field: 'wallet_roles', header: 'Wallet roles' },
);
