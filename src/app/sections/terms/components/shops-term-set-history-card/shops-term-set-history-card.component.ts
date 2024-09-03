import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, VSelectPipe, Column2 } from '@vality/ng-core';

import type { TermSetHistory, ShopTermSet } from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { createDomainObjectColumn } from '../../../../shared/utils/table2';
import { getInlineDecisions2 } from '../../utils/get-inline-decisions';
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
            children: getInlineDecisions2(getShopCashFlowSelectors(t.term_set)).filter((v) =>
                isShopTermSetDecision(v, {
                    partyId: this.data().owner_id,
                    shopId: this.data().shop_id,
                    currency: this.data().currency,
                }),
            ),
        })),
    );

    columns: Column2<TermSetHistory>[] = [
        { field: 'applied_at', cell: { type: 'datetime' } },
        createDomainObjectColumn((d) => ({ ref: { term_set_hierarchy: d?.term_set?.ref } }), {
            header: 'Term Set',
        }),
        ...SHOP_FEES_COLUMNS,
    ];
}
