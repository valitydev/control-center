import { getUnionKey } from '@vality/ng-thrift';

import type {
    CashFlowPosting,
    CashFlowSelector,
} from '@vality/dominator-proto/internal/proto/domain';

import { formatPredicate, formatCashVolumes } from '@cc/app/shared';

export interface InlineCashFlowSelector {
    if?: string;
    value?: string;
    parent?: InlineCashFlowSelector;
    level: number;
}

export function getInlineDecisions(
    d: CashFlowSelector[],
    filterValue: (v: CashFlowPosting) => boolean = (v) => getUnionKey(v?.destination) === 'system',
    level = 0,
): InlineCashFlowSelector[] {
    return d.reduce((acc, c) => {
        if (c.value) {
            acc.push({
                value: formatCashVolumes(c.value.filter(filterValue).map((v) => v.volume)),
                level,
            });
        }
        if (c.decisions?.length) {
            acc.push(
                ...c.decisions
                    .map((d) => {
                        const thenInlineDecisions = getInlineDecisions(
                            [d.then_],
                            filterValue,
                            level + 1,
                        );
                        if (d.if_) {
                            const ifInlineDecision = {
                                if: `${' '.repeat(level)}${
                                    formatPredicate(d.if_) || (level > 0 ? '↳' : '')
                                }`,
                                level,
                            };
                            return thenInlineDecisions.length > 1
                                ? [ifInlineDecision, ...thenInlineDecisions]
                                : [{ ...thenInlineDecisions[0], ...ifInlineDecision }];
                        }
                        return thenInlineDecisions;
                    })
                    .flat(),
            );
        }
        return acc;
    }, [] as InlineCashFlowSelector[]);
}
