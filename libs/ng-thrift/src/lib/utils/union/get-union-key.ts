import get from 'lodash-es/get';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import { ValuesType } from 'utility-types';

export function getUnionKeys<T>(obj: T): (keyof T)[] {
    return obj ? (Object.keys(obj) as (keyof T)[]) : [];
}

export function getUnionKeyValue<T>(obj: T): { [K in keyof T]: [K, T[K]] }[keyof T] | null {
    return isObject(obj)
        ? (Object.entries(obj).find(([, v]) => !isNil(v)) as { [K in keyof T]: [K, T[K]] }[keyof T])
        : null;
}

export function getUnionKey<T>(obj: T): keyof T | null {
    return get(getUnionKeyValue(obj), 0, null);
}

export function getUnionValue<T>(obj: T): (T extends object ? ValuesType<T> : never) | null {
    return get(getUnionKeyValue(obj), 1, null) as never;
}
