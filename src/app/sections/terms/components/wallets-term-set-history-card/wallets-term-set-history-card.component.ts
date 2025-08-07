import { Component, computed, input } from '@angular/core';
import { Column, TableModule } from '@vality/matez';

import type { TermSetHistory, WalletTermSet } from '@vality/dominator-proto/dominator';

import { createDomainObjectColumn } from '../../../../shared';
import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
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
            children: getFlatDecisions(getWalletCashFlowSelectors(t.term_set)).filter((v) =>
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
