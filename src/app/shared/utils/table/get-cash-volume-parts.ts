import { CashVolume } from '@vality/domain-proto/domain';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import isNil from 'lodash-es/isNil';

import { formatCashVolume, formatCashVolumes } from './format-cash-volume';

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
