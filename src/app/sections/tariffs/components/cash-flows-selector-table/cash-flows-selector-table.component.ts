import { Component, input } from '@angular/core';
import { CashFlowSelector } from '@vality/domain-proto/internal/domain';
import { Column, TableModule } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';

import { formatCashFlowDecisions } from '@cc/app/sections/tariffs/components/cash-flows-selector-table/format-cash-flow.decisions';
import { formatCashVolume } from '@cc/app/shared/utils/table/format-cash-volume';

@Component({
    selector: 'cc-cash-flows-selector-table',
    standalone: true,
    imports: [TableModule],
    templateUrl: './cash-flows-selector-table.component.html',
    styles: ``,
})
export class CashFlowsSelectorTableComponent {
    data = input<CashFlowSelector[]>();

    columns: Column<CashFlowSelector>[] = [
        {
            field: 'decisions',
            formatter: (d) => formatCashFlowDecisions(d?.decisions),
        },
        {
            field: 'value',
            formatter: (d) =>
                d?.value
                    ?.filter(
                        (c) =>
                            getUnionKey(c?.source) === 'merchant' &&
                            getUnionKey(c?.destination) === 'system',
                    )
                    ?.sort()
                    ?.map((c) => formatCashVolume(c.volume))
                    .join(' + '),
        },
    ];
}
