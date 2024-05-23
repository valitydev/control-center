import { CashFlowDecision } from '@vality/domain-proto/internal/domain';

import { formatCashFlowPosting } from '@cc/app/shared/utils/table/format-cash-flow-posting';
import { formatPredicate } from '@cc/app/shared/utils/table/format-predicate';

export function formatCashFlowDecisions(d: CashFlowDecision[]) {
    if (!d?.length) {
        return '';
    }
    return (
        '' +
        d
            .map(
                (d) =>
                    `if ${formatPredicate(d?.if_)} then ${d?.then_?.value
                        ?.map((p) => formatCashFlowPosting(p))
                        ?.join(', ')} ${formatCashFlowDecisions(d?.then_?.decisions)}`,
            )
            ?.join?.('; ')
    );
}
