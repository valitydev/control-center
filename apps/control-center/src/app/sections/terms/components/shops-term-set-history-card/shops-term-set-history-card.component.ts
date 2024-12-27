import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, VSelectPipe, Column } from '@vality/matez';

import type { TermSetHistory, ShopTermSet } from '@vality/dominator-proto/internal/dominator';

import { createDomainObjectColumn } from '../../../../shared';
import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { getFlatDecisions } from '../../utils/get-flat-decisions';
import {
    getShopCashFlowSelectors,
    isShopTermSetDecision,
    SHOP_FEES_COLUMNS,
} from '../shops-terms/utils/shop-fees-columns';

@Component({
    selector: 'cc-shops-term-set-history-card',
    standalone: true,
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './shops-term-set-history-card.component.html',
    styles: ``,
})
export class ShopsTermSetHistoryCardComponent {
    data = input<ShopTermSet>();
    historyData = computed(() =>
        (this.data()?.term_set_history?.reverse?.() || []).map((t) => ({
            value: t,
            children: getFlatDecisions(getShopCashFlowSelectors(t.term_set)).filter((v) =>
                isShopTermSetDecision(v, {
                    partyId: this.data().owner_id,
                    shopId: this.data().shop_id,
                    currency: this.data().currency,
                }),
            ),
        })),
    );

    columns: Column<TermSetHistory>[] = [
        { field: 'applied_at', cell: { type: 'datetime' } },
        createDomainObjectColumn((d) => ({ ref: { term_set_hierarchy: d?.term_set?.ref } }), {
            header: 'Term Set',
        }),
        ...SHOP_FEES_COLUMNS,
    ];
}
