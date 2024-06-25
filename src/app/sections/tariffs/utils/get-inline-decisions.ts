import { getUnionKey } from '@vality/ng-thrift';

import type {
    CashFlowPosting,
    CashFlowSelector,
    CashFlowAccount,
    Predicate,
} from '@vality/dominator-proto/internal/proto/domain';

import {
    formatPredicate,
    formatCashVolumes,
    compareCashVolumes,
    getCashVolumeParts,
    CashVolumeParts,
} from '@cc/app/shared';

export interface InlineCashFlowSelector {
    if?: Predicate;
    value?: string;
    parts?: CashVolumeParts;
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

export function formatLevelPredicate(v: InlineCashFlowSelector) {
    return `${'\xa0'.repeat(Math.max(v.level - 1, 0))}${v.level > 0 ? '↳' : ''} ${formatPredicate(
        v.if,
    )}`;
}

export function getInlineDecisions(
    d: CashFlowSelector[],
    filterValue: (v: CashFlowPosting) => boolean = Boolean,
    level = 0,
): InlineCashFlowSelector[] {
    return d.reduce((acc, c) => {
        if (c.value) {
            const value = c.value.filter(filterValue);
            acc.push({
                value: formatCashVolumes(value.map((v) => v.volume)),
                parts: getCashVolumeParts(value.map((v) => v.volume)),
                level,
                description: value
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
                                if: d.if_,
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
