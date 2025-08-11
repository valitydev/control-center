import { Component, computed, input } from '@angular/core';

import type { ShopTermSet, TermSetHistory } from '@vality/dominator-proto/dominator';
import { Column, TableModule } from '@vality/matez';

import { SidenavInfoModule } from '~/shared/components/sidenav-info';
import { createDomainObjectColumn } from '~/utils';

import { getFlatDecisions } from '../../utils/get-flat-decisions';
import {
    SHOP_FEES_COLUMNS,
    getShopCashFlowSelectors,
    isShopTermSetDecision,
} from '../shops-terms/utils/shop-fees-columns';

@Component({
    selector: 'cc-shops-term-set-history-card',
    imports: [SidenavInfoModule, TableModule],
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
