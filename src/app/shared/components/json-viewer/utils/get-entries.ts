export function getEntries(obj: unknown): [number | string, unknown][] {
    if (!obj) {
        return [];
    }
    return Array.isArray(obj) || obj instanceof Set
        ? Array.from(obj).map((v, idx) => [idx, v])
        : obj instanceof Map
        ? Array.from(obj)
        : Object.entries(obj);
}
