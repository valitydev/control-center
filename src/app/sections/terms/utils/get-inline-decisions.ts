import { CashFlow } from '@vality/domain-proto/internal/domain';
import { getUnionKey } from '@vality/ng-thrift';

import type {
    CashFlowSelector,
    CashFlowAccount,
    Predicate,
} from '@vality/dominator-proto/internal/proto/domain';

import { formatPredicate, compareCashVolumes } from '@cc/app/shared';

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

export function formatLevelPredicate(v: { level: number; if?: Predicate }) {
    return `${'\xa0'.repeat(Math.max(v.level - 1, 0))}${v.level > 0 ? '↳' : ''} ${formatPredicate(
        v.if,
    )}`;
}

export function formatCashFlowSourceDestination(value: CashFlow): string {
    return value
        .sort((a, b) => compareCashVolumes(a.volume, b.volume))
        .map(
            (v) =>
                `${formatCashFlowAccount(v.source)} → ${formatCashFlowAccount(v.destination)}` +
                (v.details ? ` (${v.details})` : ''),
        )
        .join(', ');
}

export interface InlineDecision2 {
    value: CashFlow;
    level: number;
    if?: Predicate;
}

export function getInlineDecisions2(d: CashFlowSelector[], level = 0) {
    return d.reduce<InlineDecision2[]>((acc, c) => {
        if (c.value) {
            acc.push({
                value: c.value.sort((a, b) => compareCashVolumes(a.volume, b.volume)),
                level,
            });
        }
        if (c.decisions?.length) {
            acc.push(
                ...c.decisions.flatMap((d) => {
                    const thenInlineDecisions = getInlineDecisions2([d.then_], level + 1);
                    if (d.if_) {
                        const ifInlineDecision = {
                            if: d.if_,
                            level,
                        };
                        return thenInlineDecisions.length > 1
                            ? [{ ...ifInlineDecision, value: [] }, ...thenInlineDecisions]
                            : [{ ...thenInlineDecisions[0], ...ifInlineDecision }];
                    }
                    return thenInlineDecisions;
                }),
            );
        }
        return acc;
    }, []);
}
