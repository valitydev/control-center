import { inject } from '@angular/core';
import { createColumn } from '@vality/matez';

import { ContractCardComponent } from '../../components/contract-card/contract-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export const createContractColumn = createColumn(
    ({ id, partyId }: { id: string; partyId: string }) => {
        const sidenavInfoService = inject(SidenavInfoService);
        return {
            value: id,
            click: () => {
                sidenavInfoService.toggle(ContractCardComponent, { id, partyId });
            },
        };
    },
    { header: 'Contract' },
);
