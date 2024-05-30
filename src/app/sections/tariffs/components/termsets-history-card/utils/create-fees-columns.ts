import type {
    CashFlowSelector,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';
import type { Column } from '@vality/ng-core';

import { getInlineDecisions } from '@cc/app/sections/tariffs/utils/get-inline-decisions';

export function createFeesColumns<T extends object>(
    getFees: (d: T) => CashFlowSelector[],
    filterFee: (v: CashFlowPosting) => boolean,
    filterRreserve?: (v: CashFlowPosting) => boolean,
    filterOther?: (v: CashFlowPosting) => boolean,
): Column<T>[] {
    const filterOtherFn: (v: CashFlowPosting) => boolean = (v) =>
        !(
            filterFee(v) ||
            (filterRreserve ? filterRreserve(v) : false) ||
            (filterOther ? filterOther(v) : false)
        );
    return [
        {
            field: 'condition',
            formatter: (d) => getInlineDecisions(getFees(d)).map((v) => v.if),
        },
        {
            field: 'fee',
            formatter: (d) => getInlineDecisions(getFees(d), filterFee).map((v) => v.value),
        },
        ...(filterRreserve
            ? [
                  {
                      field: 'rreserve',
                      header: 'RReserve',
                      formatter: (d) =>
                          getInlineDecisions(getFees(d), filterRreserve).map((v) => v.value),
                  },
              ]
            : []),
        {
            field: 'other',
            formatter: (d) => getInlineDecisions(getFees(d), filterOtherFn).map((v) => v.value),
            tooltip: (d) => getInlineDecisions(getFees(d), filterOtherFn).map((v) => v.description),
        },
    ];
}
