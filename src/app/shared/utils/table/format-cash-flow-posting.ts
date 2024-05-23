import { CashFlowPosting } from '@vality/domain-proto/internal/domain';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { formatCashVolume } from './format-cash-volume';

export function formatCashFlowPosting(p: CashFlowPosting) {
    return `${getUnionKey(p?.source)} ${getUnionValue(p?.source)} -> ${getUnionKey(
        p?.destination,
    )} ${getUnionValue(p?.destination)}: ${formatCashVolume(p.volume)}`;
}
