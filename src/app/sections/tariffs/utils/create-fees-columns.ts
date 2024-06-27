import type {
    CashFlowSelector,
    CashFlowPosting,
} from '@vality/dominator-proto/internal/proto/domain';
import type { Column, Column2 } from '@vality/ng-core';

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
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => formatLevelPredicate(v)),
        },
        {
            field: 'feeShare',
            header: 'Fee, %',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.share),
        },
        {
            field: 'feeFixed',
            header: 'Fee, fix',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.fixed),
        },
        {
            field: 'feeMin',
            header: 'Fee, min',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.min),
        },
        {
            field: 'feeMax',
            header: 'Fee, max',
            formatter: (d) =>
                getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.max),
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

export function createFeesColumns2<T extends object>(
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
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => formatLevelPredicate(v)),
            }),
        },
        {
            field: 'feeShare',
            header: 'Fee, %',
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.share),
            }),
        },
        {
            field: 'feeFixed',
            header: 'Fee, fix',
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.fixed),
            }),
        },
        {
            field: 'feeMin',
            header: 'Fee, min',
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.min),
            }),
        },
        {
            field: 'feeMax',
            header: 'Fee, max',
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterFee)
                    .filter(filterDecisions(d))
                    .map((v) => v.parts?.max),
            }),
        },
        {
            field: 'other',
            cell: (d) => ({
                value: getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterDecisions(d))
                    .map((v) => v.value),
                tooltip: getInlineDecisions(getFees(d), filterOtherFn)
                    .filter(filterDecisions(d))
                    .map((v) => v.description),
            }),
        },
    ];
}
