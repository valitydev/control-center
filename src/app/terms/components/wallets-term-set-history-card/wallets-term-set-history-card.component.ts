import { Component, computed, input } from '@angular/core';

import { TermSetHierarchyObject } from '@vality/domain-proto/domain';
import type { TermSetHistory, WalletTermSet } from '@vality/dominator-proto/dominator';
import { Column, TableModule } from '@vality/matez';

import { SidenavInfoModule } from '~/components/sidenav-info';
import { createDomainObjectColumn } from '~/utils';

import { getFlatDecisions } from '../../utils/get-flat-decisions';
import {
    WALLET_FEES_COLUMNS,
    getWalletCashFlowSelectors,
    isWalletTermSetDecision,
} from '../wallets-terms/utils/wallet-fees-columns';

@Component({
    selector: 'cc-wallets-term-set-history-card',
    imports: [SidenavInfoModule, TableModule],
    templateUrl: './wallets-term-set-history-card.component.html',
    styles: ``,
})
export class WalletsTermSetHistoryCardComponent {
    data = input<WalletTermSet>();
    historyData = computed(() =>
        (this.data()?.term_set_history?.reverse?.() || []).map((t) => ({
            value: t,
            children: getFlatDecisions(
                // TODO: remove after bump dominator
                getWalletCashFlowSelectors(t.term_set as never as TermSetHierarchyObject),
            ).filter((v) =>
                isWalletTermSetDecision(v, {
                    partyId: this.data().owner_id,
                    walletId: this.data().wallet_id,
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
        ...WALLET_FEES_COLUMNS,
    ];
}
