import type {
    CashFlowSelector,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';
import type { Column2 } from '@vality/ng-core';

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
): Column2<T>[] {
    const filterOtherFn: (v: CashFlowPosting) => boolean = (v) =>
        !filterFee(v) &&
        filterOther(v) &&
        !(v?.volume?.share?.parts?.p === 1 && v?.volume?.share?.parts?.q === 1);
    return [
        {
            field: 'condition',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: formatLevelPredicate(v) })) as any,
        },
        {
            field: 'feeShare',
            header: 'Fee, %',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: v.parts?.share })) as any,
        },
        {
            field: 'feeFixed',
            header: 'Fee, fix',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: v.parts?.fixed })) as any,
        },
        {
            field: 'feeMin',
            header: 'Fee, min',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: v.parts?.max })) as any,
        },
        {
            field: 'feeMax',
            header: 'Fee, max',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: v.parts?.min })) as any,
        },
        {
            field: 'other',
            cell: (d) =>
                getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterDecisions(d))
                    .map((v) => ({ value: v.value, tooltip: v.description })) as any,
        },
    ];
}
