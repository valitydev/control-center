import { Component, input } from '@angular/core';
import { TermSetHierarchyObject } from '@vality/domain-proto/internal/domain';
import { TableModule, type Column } from '@vality/ng-core';

import type { CashFlowSelector } from '@vality/dominator-proto/internal/proto/domain';

import { getInlineDecisions } from '@cc/app/sections/tariffs/utils/get-inline-decisions';

import { CardComponent } from '../sidenav-info/components/card/card.component';
import { getDomainObjectDetails } from '../thrift-api-crud';

export interface TermSetHierarchyObjectFees {
    object: TermSetHierarchyObject;
    fees: CashFlowSelector[];
}

@Component({
    selector: 'cc-termsets-card',
    standalone: true,
    imports: [CardComponent, TableModule],
    templateUrl: './termsets-history-card.component.html',
    styles: ``,
})
export class TermsetsHistoryCardComponent {
    data = input<TermSetHierarchyObjectFees[]>();
    columns: Column<TermSetHierarchyObjectFees>[] = [
        {
            field: 'term_set',
            formatter: (d) => getDomainObjectDetails({ term_set_hierarchy: d?.object })?.label,
            description: (d) =>
                getDomainObjectDetails({ term_set_hierarchy: d?.object })?.description,
        },
        {
            field: 'condition',
            formatter: (d) => getInlineDecisions(d?.fees).map((v) => v.if),
        },
        {
            field: 'fee',
            formatter: (d) =>
                getInlineDecisions(
                    d?.fees,
                    (v) => v?.source?.merchant === 0 && v?.destination?.system === 0,
                ).map((v) => v.value),
        },
        {
            field: 'rreserve',
            header: 'RReserve',
            formatter: (d) =>
                getInlineDecisions(
                    d?.fees,
                    (v) => v?.source?.merchant === 0 && v?.destination?.merchant === 1,
                ).map((v) => v.value),
        },
        {
            field: 'other',
            formatter: (d) =>
                getInlineDecisions(
                    d?.fees,
                    (v) =>
                        !(
                            (v?.source?.merchant === 0 && v?.destination?.system === 0) ||
                            (v?.source?.merchant === 0 && v?.destination?.merchant === 1)
                        ),
                ).map((v) => v.value),
        },
    ];
}
