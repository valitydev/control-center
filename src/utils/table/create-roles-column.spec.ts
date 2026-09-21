import { firstValueFrom } from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { Column, Value, normalizeCell } from '@vality/matez';
import { domain } from '@vality/org-management-proto/admin_management';

import { createRolesColumn, createWalletRolesColumn } from './create-roles-column';

describe('createRolesColumn and createWalletRolesColumn', () => {
    async function resolveCellValue<T extends object>(column: Column<T>, data: T): Promise<Value> {
        return await firstValueFrom(normalizeCell(column.field, column.cell)(data, 0));
    }

    it('creates roles column with general roles sorted by priority and dash for empty', async () => {
        const column = TestBed.runInInjectionContext(() =>
            createRolesColumn<{ roles: domain.MemberRole[] }>((d) => ({ roles: d.roles })),
        );
        expect(column.field).toBe('roles');
        expect(column.header).toBe('Roles');

        const filledRoles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 's1' } },
            { id: '2', role_id: 'Administrator' },
            { id: '3', role_id: 'WalletManager' },
        ];
        const filledCell = await resolveCellValue(column, { roles: filledRoles });
        expect(filledCell.value).toBe('Administrator, Manager');
        expect(filledCell.tooltip).toBe('Administrator, Manager');
        expect(filledCell.click).toBeUndefined();

        const emptyCell = await resolveCellValue(column, { roles: [] });
        expect(emptyCell.value).toBe('—');
        expect(emptyCell.tooltip).toBe('—');
    });

    it('attaches click handler when provided in params', async () => {
        const click = vi.fn();
        const column = TestBed.runInInjectionContext(() =>
            createRolesColumn<{ roles: domain.MemberRole[] }>((d) => ({ roles: d.roles, click })),
        );
        const cell = await resolveCellValue(column, {
            roles: [{ id: '1', role_id: 'Administrator' }],
        });
        expect(cell.click).toBe(click);
    });

    it('creates wallet roles column with wallet roles sorted by priority', async () => {
        const column = TestBed.runInInjectionContext(() =>
            createWalletRolesColumn<{ roles: domain.MemberRole[] }>((d) => ({ roles: d.roles })),
        );
        expect(column.field).toBe('wallet_roles');
        expect(column.header).toBe('Wallet roles');

        const roles: domain.MemberRole[] = [
            { id: '1', role_id: 'Manager', scope: { scope_id: 'Shop', resource_id: 's1' } },
            { id: '2', role_id: 'WalletManager' },
            { id: '3', role_id: 'Integrator', scope: { scope_id: 'Wallet', resource_id: 'w1' } },
        ];
        const cell = await resolveCellValue(column, { roles });
        expect(cell.value).toBe('Integrator, WalletManager');
        expect(cell.tooltip).toBe('Integrator, WalletManager');
    });
});
