import { Component, input } from '@angular/core';
import { Column2, getEnumKey, TableModule } from '@vality/ng-core';
import { repairer } from '@vality/repairer-proto';
import { StatusHistory } from '@vality/repairer-proto/repairer';
import { startCase } from 'lodash-es';

import { SidenavInfoModule } from '@cc/app/shared/components/sidenav-info';

@Component({
    standalone: true,
    template: `<cc-card title="Machine #{{ id() }} Status History"
        ><v-table [columns]="columns" [data]="history()"></v-table
    ></cc-card>`,
    imports: [TableModule, SidenavInfoModule],
})
export class MachineStatusHistoryCardComponent {
    history = input<StatusHistory[]>([]);
    id = input<string>('');

    columns: Column2<StatusHistory>[] = [
        { field: 'changed_at', cell: { type: 'datetime' } },
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getEnumKey(repairer.RepairStatus, d.status)),
                color: (
                    {
                        failed: 'warn',
                        in_progress: 'pending',
                        repaired: 'success',
                    } as const
                )[getEnumKey(repairer.RepairStatus, d.status)],
            }),
        },
    ];
}
