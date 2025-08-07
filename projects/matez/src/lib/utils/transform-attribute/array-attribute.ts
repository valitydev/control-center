import { Nil } from '../empty';

export function arrayAttribute<T>(value: ArrayAttributeTransform<T>): T[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value;
}

export type ArrayAttributeTransform<T> = T[] | Nil;
