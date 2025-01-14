import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Column, TableModule, VSelectPipe } from '@vality/matez';

import type {
    ProvisionTermSetHistory,
    TerminalTermSet,
} from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import {
    TERMINAL_FEES_COLUMNS,
    getTerminalTreeDataItem,
} from '../terminals-terms/utils/terminal-fees-columns';

@Component({
    selector: 'cc-shops-term-set-history-card',
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './terminals-term-set-history-card.component.html',
    styles: ``
})
export class TerminalsTermSetHistoryCardComponent {
    data = input<TerminalTermSet>();
    historyData = computed(() =>
        (this.data()?.term_set_history?.reverse?.() || []).map(
            getTerminalTreeDataItem((d) => d.term_set),
        ),
    );

    columns: Column<ProvisionTermSetHistory>[] = [
        { field: 'applied_at', cell: { type: 'datetime' } },
        ...TERMINAL_FEES_COLUMNS,
    ];
}
