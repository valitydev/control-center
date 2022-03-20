export function getEnumKeys<E extends Record<PropertyKey, unknown>>(srcEnum: E): (keyof E)[] {
    return Object.values(srcEnum).filter((v) => typeof v === 'string') as string[];
}
