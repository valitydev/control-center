import { ValuesType } from 'utility-types';

export function getEnumKeyValues<E extends Record<PropertyKey, unknown>>(srcEnum: E) {
    return Object.entries(srcEnum)
        .filter(([, v]) => typeof v === 'string')
        .map(([value, key]) => ({ key, value })) as { key: keyof E; value: ValuesType<E> }[];
}

export function getEnumKeys<E extends Record<PropertyKey, unknown>>(srcEnum: E): (keyof E)[] {
    return Object.values(srcEnum).filter((v) => typeof v === 'string') as string[];
}
