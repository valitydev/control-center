import { CashVolume } from '@vality/domain-proto/internal/domain';
import { formatCurrency } from '@vality/ng-core';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import isNil from 'lodash-es/isNil';

import { formatRational } from './format-rational';

const CASH_VOLUME_PRIORITY: Record<keyof CashVolume, number> = {
    share: 0,
    fixed: 1,
    product: 2,
};

export function compareCashVolumes(a: CashVolume, b: CashVolume) {
    return CASH_VOLUME_PRIORITY[getUnionKey(a)] - CASH_VOLUME_PRIORITY[getUnionKey(b)];
}

export function formatCashVolumes(c: CashVolume[]) {
    return c.sort(compareCashVolumes).map(formatCashVolume).join(' + ');
}

export interface CashVolumeParts {
    fixed?: string;
    share?: string;
    min?: string;
    max?: string;
}

export function getCashVolumeParts(c: CashVolume[]): CashVolumeParts {
    const res: CashVolumeParts = {};
    const def: CashVolumeParts = { share: formatCashVolumes(c) };
    for (const part of c) {
        switch (getUnionKey(part)) {
            case 'fixed': {
                if (!isNil(res.fixed)) {
                    return def;
                }
                res.fixed = formatCashVolume(part);
                break;
            }
            case 'share': {
                if (!isNil(res.share)) {
                    return def;
                }
                res.share = formatCashVolume(part);
                break;
            }
            case 'product': {
                if (!isNil(res.fixed) && !isNil(res.share)) {
                    return def;
                }
                const products = Array.from(getUnionValue(part.product));
                if (products.length > 2) {
                    return def;
                }
                let fixedProduct: CashVolume;
                let shareProduct: CashVolume;
                if (
                    getUnionKey(products[0]) === 'fixed' &&
                    (products.length === 1 || getUnionKey(products[1]) === 'share')
                ) {
                    fixedProduct = products[0];
                    shareProduct = products[1];
                } else if (
                    getUnionKey(products[0]) === 'share' &&
                    (products.length === 1 || getUnionKey(products[1]) === 'fixed')
                ) {
                    shareProduct = products[0];
                    fixedProduct = products[1];
                } else {
                    return def;
                }
                if (products.length === 1) {
                    if (shareProduct && isNil(res.share)) {
                        res.share = formatCashVolume(shareProduct);
                    } else if (fixedProduct && isNil(res.fixed)) {
                        res.fixed = formatCashVolume(fixedProduct);
                    } else {
                        return def;
                    }
                } else {
                    switch (getUnionKey(part.product)) {
                        case 'min_of': {
                            if (!isNil(res.min)) {
                                return def;
                            }
                            if (isNil(res.fixed)) {
                                res.fixed = formatCashVolume(fixedProduct);
                                res.min = formatCashVolume(shareProduct);
                            } else if (isNil(res.share)) {
                                res.share = formatCashVolume(shareProduct);
                                res.min = formatCashVolume(fixedProduct);
                            } else {
                                return def;
                            }
                            break;
                        }
                        case 'max_of': {
                            if (!isNil(res.max)) {
                                return def;
                            }
                            if (isNil(res.fixed)) {
                                res.fixed = formatCashVolume(fixedProduct);
                                res.max = formatCashVolume(shareProduct);
                            } else if (isNil(res.share)) {
                                res.share = formatCashVolume(shareProduct);
                                res.max = formatCashVolume(fixedProduct);
                            } else {
                                return def;
                            }
                            break;
                        }
                        case 'sum_of': {
                            if (!isNil(res.fixed) || !isNil(res.share)) {
                                return def;
                            }
                            res.fixed = formatCashVolume(fixedProduct);
                            res.share = formatCashVolume(shareProduct);
                            break;
                        }
                    }
                }
            }
        }
    }
    return res;
}

export function formatCashVolume(d: CashVolume): string {
    switch (getUnionKey(d)) {
        case 'fixed':
            return formatCurrency(d?.fixed?.cash?.amount, d?.fixed?.cash?.currency?.symbolic_code);
        case 'share':
            return (
                formatRational(d?.share?.parts) +
                (d?.share?.of === 2 ? ' of surplus' : '') +
                (d?.share?.rounding_method === 1 ? ' (round .5+)' : '')
            );
        case 'product': {
            const products = Array.from(getUnionValue(d.product));
            if (products.length === 1) {
                return formatCashVolume(products[0]);
            }
            const childrenCashVolumes = products
                .sort(compareCashVolumes)
                .map((c) => formatCashVolume(c));
            if (getUnionKey(d.product) === 'sum_of') {
                return childrenCashVolumes.join(' + ');
            }
            return `${getUnionKey(d.product).slice(0, -3)}(${childrenCashVolumes.join(', ')})`;
        }
    }
}
