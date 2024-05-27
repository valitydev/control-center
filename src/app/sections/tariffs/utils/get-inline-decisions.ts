import { getUnionKey } from '@vality/ng-thrift';

import type {
    CashFlowPosting,
    CashFlowSelector,
    CashFlowAccount,
} from '@vality/dominator-proto/internal/proto/domain';

import { formatPredicate, formatCashVolumes, compareCashVolumes } from '@cc/app/shared';

export interface InlineCashFlowSelector {
    if?: string;
    value?: string;
    parent?: InlineCashFlowSelector;
    description?: string;
    level: number;
}

// TODO: use enums
function formatCashFlowAccount(acc: CashFlowAccount) {
    return (
        getUnionKey(acc) +
        ':' +
        (() => {
            switch (getUnionKey(acc)) {
                case 'system':
                    return {
                        0: 'settlement',
                        1: 'subagent',
                    }[acc.system];
                case 'merchant':
                    return {
                        0: 'settlement',
                        1: 'guarantee',
                        2: 'payout',
                    }[acc.merchant];
                case 'wallet':
                    return {
                        0: 'sender_source',
                        1: 'sender_settlement',
                        2: 'receiver_settlement',
                        3: 'receiver_destination',
                    }[acc.wallet];
                case 'external':
                    return {
                        0: 'income',
                        1: 'outcome',
                    }[acc.external];
                case 'provider':
                    return {
                        0: 'settlement',
                    }[acc.provider];
            }
        })()
    );
}

export function getInlineDecisions(
    d: CashFlowSelector[],
    filterValue: (v: CashFlowPosting) => boolean = Boolean,
    level = 0,
): InlineCashFlowSelector[] {
    return d.reduce((acc, c) => {
        if (c.value) {
            acc.push({
                value: formatCashVolumes(c.value.filter(filterValue).map((v) => v.volume)),
                level,
                description: c.value
                    .filter(filterValue)
                    .sort((a, b) => compareCashVolumes(a.volume, b.volume))
                    .map(
                        (v) =>
                            `${formatCashFlowAccount(v.source)} → ${formatCashFlowAccount(
                                v.destination,
                            )}` + (v.details ? ` (${v.details})` : ''),
                    )
                    .join(', '),
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
