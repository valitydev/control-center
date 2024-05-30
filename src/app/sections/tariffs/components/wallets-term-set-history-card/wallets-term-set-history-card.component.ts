import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, type Column, VSelectPipe } from '@vality/ng-core';

import type { TermSetHistory } from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { getDomainObjectDetails } from '../../../../shared/components/thrift-api-crud';
import { createWalletFeesColumn } from '../wallets-tariffs/utils/create-wallet-fees-column';

@Component({
    selector: 'cc-wallets-term-set-history-card',
    standalone: true,
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './wallets-term-set-history-card.component.html',
    styles: ``,
})
export class WalletsTermSetHistoryCardComponent {
    data = input<TermSetHistory[]>();
    columns: Column<TermSetHistory>[] = [
        { field: 'applied_at', type: 'datetime' },
        {
            field: 'term_set',
            formatter: (d) => getDomainObjectDetails({ term_set_hierarchy: d?.term_set })?.label,
            description: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d?.term_set })?.description,
        },
        ...createWalletFeesColumn<TermSetHistory>((d) => d.term_set),
    ];
}
