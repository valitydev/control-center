import { difference } from 'lodash-es';
import isEqual from 'lodash-es/isEqual';

import { isEmpty } from '../empty';

export function countChanged<T extends object>(
    a: T,
    b: T,
    // is equal boolean or count number
    predicates: { [K in keyof T]?: (a: T[K], b: T[K]) => number | boolean } = {},
): number {
    const aKeys: (keyof T)[] = Object.keys(a) as never;
    const bKeys: (keyof T)[] = Object.keys(b) as never;
    const diffKeys = difference(aKeys, bKeys);
    const sameKeys = difference(aKeys, diffKeys);
    return sameKeys
        .map((k) => {
            if (k in predicates) {
                const res = predicates[k]?.(a[k], b[k]);
                return typeof res === 'boolean' ? +!res : Number(res);
            }
            return (isEmpty(a[k]) && isEmpty(b[k])) || isEqual(a[k], b[k]) ? 0 : 1;
        })
        .reduce((sum, v) => sum + v, diffKeys.length);
}
