import { CashVolume } from '@vality/domain-proto/internal/domain';
import { formatCurrency } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { formatRational } from './format-rational';

const CASH_VOLUME_PRIORITY: Record<keyof CashVolume, number> = {
    fixed: 0,
    share: 1,
    product: 2,
};

export function compareCashVolumes(a: CashVolume, b: CashVolume) {
    return CASH_VOLUME_PRIORITY[getUnionKey(a)] - CASH_VOLUME_PRIORITY[getUnionKey(b)];
}

export function formatCashVolumes(c: CashVolume[]) {
    return c.sort(compareCashVolumes).map(formatCashVolume).join(' + ');
}

export function formatCashVolume(d: CashVolume) {
    switch (getUnionKey(d)) {
        case 'fixed':
            return formatCurrency(d?.fixed?.cash?.amount, d?.fixed?.cash?.currency?.symbolic_code);
        case 'share':
            return (
                formatRational(d?.share?.parts) +
                (d?.share?.of === 2 ? ' of surplus' : '') +
                (d?.share?.rounding_method === 1 ? ' (round .5+)' : '')
            );
        case 'product':
            return `${getUnionKey(d.product).slice(0, -3)}(${Array.from(getUnionValue(d.product))
                .sort(compareCashVolumes)
                .map((c) => formatCashVolume(c))
                .join(', ')})`;
    }
}
