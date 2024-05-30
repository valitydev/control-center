import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TableModule, type Column, VSelectPipe } from '@vality/ng-core';

import type { TermSetHistory } from '@vality/dominator-proto/internal/dominator';
import type { CashFlowSelector } from '@vality/dominator-proto/internal/proto/domain';

import { CardComponent } from '../../../../shared/components/sidenav-info/components/card/card.component';
import { getDomainObjectDetails } from '../../../../shared/components/thrift-api-crud';

import { createFeesColumns } from './utils/create-fees-columns';

export interface TermSetHierarchyObjectFees {
    object: TermSetHistory;
    fees: CashFlowSelector[];
}

@Component({
    selector: 'cc-termsets-card',
    standalone: true,
    imports: [CommonModule, CardComponent, TableModule, VSelectPipe, MatTooltip],
    templateUrl: './termsets-history-card.component.html',
    styles: ``,
})
export class TermsetsHistoryCardComponent {
    data = input<TermSetHierarchyObjectFees[]>();
    columns: Column<TermSetHierarchyObjectFees>[] = [
        { field: 'object.applied_at', type: 'datetime' },
        {
            field: 'term_set',
            formatter: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d?.object?.term_set })?.label,
            description: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d?.object?.term_set })?.description,
        },
        ...createFeesColumns<TermSetHierarchyObjectFees>(
            (d) => d?.fees,
            (v) => v?.source?.merchant === 0 && v?.destination?.system === 0,
            (v) => v?.source?.merchant === 0 && v?.destination?.merchant === 1,
        ),
    ];
}
