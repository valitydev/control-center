import { Component, input } from '@angular/core';
import { TimedTermSet } from '@vality/dominator-proto/internal/proto/domain';
import { Column, TableModule } from '@vality/ng-core';

import { formatPredicate } from '@cc/app/shared/utils/table/format-predicate';

@Component({
    selector: 'cc-termsets-table',
    standalone: true,
    imports: [TableModule],
    templateUrl: './termsets-table.component.html',
    styles: ``,
})
export class TermsetsTableComponent {
    data = input<TimedTermSet[]>();
    columns: Column<TimedTermSet>[] = [
        {
            field: 'condition',
            formatter: (d) => formatPredicate(d.terms?.payments?.currencies?.decisions?.[0]?.if_),
        },
        {
            field: 'value',
            formatter: (d) =>
                Array.from(d.terms?.payments?.currencies?.decisions?.[0]?.then_?.value || [])
                    ?.map?.((v) => v?.symbolic_code)
                    .join(', '),
        },
        {
            field: 'lower_bound_time',
            type: 'datetime',
            formatter: (d) => d.action_time?.lower_bound?.bound_time,
        },
        {
            field: 'upper_bound_time',
            type: 'datetime',
            formatter: (d) => d.action_time?.upper_bound?.bound_time,
        },
    ];
}
