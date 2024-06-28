import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, VSelectPipe, Column2 } from '@vality/ng-core';

import type { TermSetHistory, ShopTermSet } from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { getDomainObjectDetails } from '../../../../shared/components/thrift-api-crud';
import { createShopFeesColumn } from '../shops-tariffs/utils/create-shop-fees-column';

@Component({
    selector: 'cc-shops-term-set-history-card',
    standalone: true,
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './shops-term-set-history-card.component.html',
    styles: ``,
})
export class ShopsTermSetHistoryCardComponent {
    data = input<ShopTermSet>();
    historyData = computed(() => this.data()?.term_set_history?.reverse?.());

    columns: Column2<TermSetHistory>[] = [
        { field: 'applied_at', cell: { type: 'datetime' } },
        {
            field: 'term_set',
            cell: (d) => ({
                value: getDomainObjectDetails({ term_set_hierarchy: d?.term_set })?.label,
                description: (d) =>
                    getDomainObjectDetails({ term_set_hierarchy: d?.term_set })?.description,
            }),
        },
        ...createShopFeesColumn<TermSetHistory>(
            (d) => d.term_set,
            () => this.data().owner_id,
            () => this.data().shop_id,
            () => this.data().currency,
        ),
    ];
}
