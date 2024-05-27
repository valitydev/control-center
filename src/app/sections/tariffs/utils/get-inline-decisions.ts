import { getUnionKey } from '@vality/ng-thrift';
import { formatCashVolume, formatPredicate } from 'src/app/shared';

import type {
    CashFlowPosting,
    CashFlowSelector,
} from '@vality/dominator-proto/internal/proto/domain';

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
                value: c.value
                    .filter(filterValue)
                    .map((v) => formatCashVolume(v.volume))
                    .join(' + '),
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
                                : [{ ...ifInlineDecision, value: thenInlineDecisions[0].value }];
                        }
                        return thenInlineDecisions;
                    })
                    .flat(),
            );
        }
        return acc;
    }, [] as InlineCashFlowSelector[]);
}
