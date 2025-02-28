import { ValuesType } from 'utility-types';

export type Enum = Record<PropertyKey, unknown>;

export function getEnumEntries<E extends Enum>(srcEnum: E): [key: keyof E, value: ValuesType<E>][] {
    if (!srcEnum) {
        return [];
    }
    const entries = Object.entries(srcEnum);
    if (!entries.length) {
        return [];
    }
    const isValueNumberEnum = entries.some(([, v]) => typeof v === 'number');
    if (isValueNumberEnum) {
        return entries.filter(([, v]) => typeof v === 'number') as never;
    }
    return entries as never;
}

export function getEnumKeyValues<E extends Enum>(
    srcEnum: E,
): { key: keyof E; value: ValuesType<E> }[] {
    return getEnumEntries(srcEnum).map(([key, value]) => ({ key, value }));
}

export function getEnumKeys<E extends Enum>(srcEnum: E): (keyof E)[] {
    return getEnumEntries(srcEnum).map(([k]) => k);
}

export function getEnumValues<E extends Enum>(srcEnum: E): ValuesType<E>[] {
    return getEnumEntries(srcEnum).map(([, v]) => v);
}

export function getEnumKey<E extends Enum>(srcEnum: E, value: ValuesType<E>): keyof E {
    return getEnumKeyValues(srcEnum).find((e) => String(e.value) === String(value))?.key as keyof E;
}

export function enumHasValue<E extends Enum>(
    srcEnum: E,
    value: ValuesType<E> | string,
): value is ValuesType<E> {
    return getEnumValues(srcEnum).includes(value as ValuesType<E>);
}
