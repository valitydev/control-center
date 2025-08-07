import { ValuesType } from 'utility-types';

import { isEmpty } from '../empty/is-empty';
import { isEmptyPrimitive } from '../empty/is-empty-primitive';

export function clean<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends readonly any[] | ArrayLike<any> | Record<any, any>,
    TAllowRootRemoval extends boolean = false,
>(
    obj: T,
    allowRootRemoval: TAllowRootRemoval = false as TAllowRootRemoval,
    isNotDeep = false,
    filterPredicate: (v: unknown, k?: PropertyKey) => boolean = (v) => !isEmpty(v),
): TAllowRootRemoval extends true ? T | null : T {
    if (allowRootRemoval && !filterPredicate(obj)) {
        return null as never;
    }
    const cleanChild = (v: unknown) =>
        isNotDeep ? v : clean(v as never, true, isNotDeep, filterPredicate);
    if (Array.isArray(obj)) {
        return (obj as ValuesType<T>[])
            .map((v) => cleanChild(v))
            .filter((v, idx) => filterPredicate(v, idx)) as never;
    }
    if (obj?.constructor === Object) {
        return Object.fromEntries(
            (Object.entries(obj) as [keyof T, ValuesType<T>][])
                .map(([k, v]) => [k, cleanChild(v)] as const)
                .filter(([k, v]) => filterPredicate(v, k)),
        ) as never;
    }
    return obj;
}

export function cleanPrimitiveProps<T extends object>(
    obj: T,
    allowRootRemoval = false,
    isNotDeep = false,
) {
    return clean(obj, allowRootRemoval, isNotDeep, (v) => !isEmptyPrimitive(v));
}
