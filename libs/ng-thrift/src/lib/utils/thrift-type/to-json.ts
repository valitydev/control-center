export function toJson(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    } else if (Array.isArray(obj)) {
        return obj.map((v) => toJson(v));
    } else if (obj instanceof Map) {
        return Array.from(obj).map(([k, v]) => [toJson(k), toJson(v)]);
    } else if (obj instanceof Set) {
        return Array.from(obj).map((v) => toJson(v));
    }
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toJson(v)]));
}
