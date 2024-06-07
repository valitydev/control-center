import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, type Column, VSelectPipe } from '@vality/ng-core';

import type { ProvisionTermSetHistory } from '@vality/dominator-proto/internal/dominator';

import { SidenavInfoModule } from '../../../../shared/components/sidenav-info';
import { createTerminalFeesColumn } from '../terminals-terms/utils/create-terminal-fees-column';

@Component({
    selector: 'cc-shops-term-set-history-card',
    standalone: true,
    imports: [CommonModule, SidenavInfoModule, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './terminals-term-set-history-card.component.html',
    styles: ``,
})
export class TerminalsTermSetHistoryCardComponent {
    data = input<ProvisionTermSetHistory[]>();
    columns: Column<ProvisionTermSetHistory>[] = [
        { field: 'applied_at', type: 'datetime' },
        ...createTerminalFeesColumn<ProvisionTermSetHistory>((d) => d.term_set),
    ];
}
