import { startCase } from 'lodash-es';

import { Component, input } from '@angular/core';

import { Column, TableModule, getEnumKey } from '@vality/matez';
import { RepairStatus, StatusHistory } from '@vality/repairer-proto/repairer';

import { SidenavInfoModule } from '~/components/sidenav-info/sidenav-info.module';

@Component({
    template: `<cc-card title="Machine #{{ id() }} Status History"
        ><v-table [columns]="columns" [data]="history()"></v-table
    ></cc-card>`,
    imports: [TableModule, SidenavInfoModule],
})
export class MachineStatusHistoryCardComponent {
    history = input<StatusHistory[]>([]);
    id = input<string>('');

    columns: Column<StatusHistory>[] = [
        { field: 'changed_at', cell: { type: 'datetime' } },
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getEnumKey(RepairStatus, d.status)),
                color: (
                    {
                        failed: 'warn',
                        in_progress: 'pending',
                        repaired: 'success',
                    } as const
                )[getEnumKey(RepairStatus, d.status)],
            }),
        },
    ];
}
