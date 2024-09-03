import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, VSelectPipe, Column2 } from '@vality/ng-core';

import type { TermSetHistory, WalletTermSet } from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { createDomainObjectColumn } from '../../../../shared/utils/table2';
import { getInlineDecisions2 } from '../../utils/get-inline-decisions';
import {
    WALLET_FEES_COLUMNS,
    isWalletTermSetDecision,
    getWalletCashFlowSelectors,
} from '../wallets-terms/utils/wallet-fees-columns';

@Component({
    selector: 'cc-wallets-term-set-history-card',
    standalone: true,
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './wallets-term-set-history-card.component.html',
    styles: ``,
})
export class WalletsTermSetHistoryCardComponent {
    data = input<WalletTermSet>();
    historyData = computed(() =>
        (this.data()?.term_set_history?.reverse?.() || []).map((t) => ({
            value: t,
            children: getInlineDecisions2(getWalletCashFlowSelectors(t.term_set)).filter((v) =>
                isWalletTermSetDecision(v, {
                    partyId: this.data().owner_id,
                    walletId: this.data().wallet_id,
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
        ...WALLET_FEES_COLUMNS,
    ];
}
