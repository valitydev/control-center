import { createObjectHash } from './create-object-hash';

export function createObjectsHashMap<T extends object>(
    objects: T[],
    getObjectKey: (obj: T) => unknown,
): Map<string, T> {
    return new Map(objects.map((obj) => [createObjectHash(getObjectKey(obj)), obj]));
}
