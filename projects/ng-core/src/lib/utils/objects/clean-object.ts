import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import { ValuesType } from 'utility-types';

function isEmptyValue(value: unknown): boolean {
    return isNil(value) || value === '' || (Array.isArray(value) && !value.length); // || (typeof value === 'object' && isEmpty(value));
}

export function cleanObject<T extends object>(
    obj: T,
    requiredKeys: (keyof T)[] = [],
    isNotDeep = false
): T {
    if (!isObject(obj)) return obj;
    if (Array.isArray(obj))
        return obj
            .slice()
            .map((v: unknown) => (isObject(v) && !isNotDeep ? cleanObject(v) : v))
            .filter((v) => !isEmptyValue(v)) as T;
    return Object.fromEntries(
        (Object.entries(obj) as [keyof T, ValuesType<T>][])
            .map(([k, v]) => [k, isObject(v) && !isNotDeep ? cleanObject(v as object) : v] as const)
            .filter(([k, v]) => requiredKeys.includes(k) || !isEmptyValue(v))
    ) as T;
}
