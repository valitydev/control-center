/**
 * Creates a union {[key]: {}}
 * Compatible with array methods (.map and others)
 */
export function createUnion<T extends PropertyKey, V>(
    key: T,
    value: V = {} as V,
): Record<T, V extends object ? V : NonNullable<unknown>> {
    return { [key]: typeof value === 'object' ? value : {} } as never;
}
