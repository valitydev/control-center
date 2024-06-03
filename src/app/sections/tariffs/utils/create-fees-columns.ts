import type {
    CashFlowSelector,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';
import type { Column } from '@vality/ng-core';

import {
    getInlineDecisions,
    formatLevelPredicate,
    type InlineCashFlowSelector,
} from './get-inline-decisions';

export function createFeesColumns<T extends object>(
    getFees: (d: T) => CashFlowSelector[],
    filterFee: (v: CashFlowPosting) => boolean,
    filterRreserve?: (v: CashFlowPosting) => boolean,
    filterOther?: (v: CashFlowPosting) => boolean,
    walletId?: (d: T) => string,
): Column<T>[] {
    const filterOtherFn: (v: CashFlowPosting) => boolean = (v) =>
        !(
            filterFee(v) ||
            (filterRreserve ? filterRreserve(v) : false) ||
            (filterOther ? filterOther(v) : false)
        );
    const filterFn = (d: T) => (v: InlineCashFlowSelector) =>
        !v?.if?.condition?.party || v?.if?.condition?.party?.definition?.wallet_is === walletId(d);
    return [
        {
            field: 'condition',
            formatter: (d) =>
                getInlineDecisions(getFees(d))
                    .filter(filterFn(d))
                    .map((v) => formatLevelPredicate(v)),
        },
        {
            field: 'fee',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterFn(d))
                    .map((v) => v.value),
        },
        ...(filterRreserve
            ? [
                  {
                      field: 'rreserve',
                      header: 'RReserve',
                      formatter: (d) =>
                          getInlineDecisions(getFees(d), filterRreserve)
                              .filter(filterFn(d))
                              .map((v) => v.value),
                  },
              ]
            : []),
        {
            field: 'other',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterFn(d))
                    .map((v) => v.value),
            tooltip: (d) =>
                getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterFn(d))
                    .map((v) => v.description),
        },
    ];
}
