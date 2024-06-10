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
    filterOther: (v: CashFlowPosting) => boolean = () => true,
    filterDecisions: (d: T) => (v: InlineCashFlowSelector) => boolean = () => () => true,
): Column<T>[] {
    const filterOtherFn: (v: CashFlowPosting) => boolean = (v) =>
        !filterFee(v) &&
        filterOther(v) &&
        !(v?.volume?.share?.parts?.p === 1 && v?.volume?.share?.parts?.q === 1);
    return [
        {
            field: 'condition',
            formatter: (d) =>
                getInlineDecisions(getFees(d))
                    .filter(filterDecisions(d))
                    .map((v) => formatLevelPredicate(v)),
        },
        {
            field: 'fee',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.value),
        },
        {
            field: 'other',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterDecisions(d))
                    .map((v) => v.value),
            tooltip: (d) =>
                getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterDecisions(d))
                    .map((v) => v.description),
        },
    ];
}
