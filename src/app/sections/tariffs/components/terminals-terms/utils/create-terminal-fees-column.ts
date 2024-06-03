import type { ProvisionTermSet } from '@vality/dominator-proto/internal/proto/domain';
import type { Column } from '@vality/ng-core';

import { getInlineDecisions, formatLevelPredicate } from '../../../utils/get-inline-decisions';

export function createTerminalFeesColumn<T extends object>(
    fn: (d: T) => ProvisionTermSet = (d) => d as never,
): Column<T>[] {
    return [
        {
            field: 'payments_condition',
            formatter: (d) =>
                getInlineDecisions([fn(d)?.payments?.cash_flow].filter(Boolean)).map((v) =>
                    formatLevelPredicate(v),
                ),
        },
        {
            field: 'payments',
            formatter: (d) =>
                getInlineDecisions([fn(d)?.payments?.cash_flow].filter(Boolean)).map(
                    (v) => v?.value,
                ),
        },
        {
            field: 'wallets_condition',
            formatter: (d) =>
                getInlineDecisions([fn(d)?.wallet?.withdrawals?.cash_flow].filter(Boolean)).map(
                    (v) => formatLevelPredicate(v),
                ),
        },
        {
            field: 'wallets',
            formatter: (d) =>
                getInlineDecisions([fn(d)?.wallet?.withdrawals?.cash_flow].filter(Boolean)).map(
                    (v) => v?.value,
                ),
        },
    ];
}
