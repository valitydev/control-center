import { CashVolume } from '@vality/domain-proto/internal/domain';
import { formatCurrency } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { formatRational } from './format-rational';

export function formatCashVolume(d: CashVolume) {
    switch (getUnionKey(d)) {
        case 'fixed':
            return formatCurrency(d?.fixed?.cash?.amount, d?.fixed?.cash?.currency?.symbolic_code);
        case 'share':
            return formatRational(d?.share?.parts);
        case 'product':
            return `${getUnionKey(d.product).slice(0, -3)}(${Array.from(getUnionValue(d.product))
                .map((c) => formatCashVolume(c))
                .join(', ')})`;
    }
}
