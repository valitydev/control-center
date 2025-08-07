function isNumber(v: unknown): boolean {
    return !!v && (typeof v === 'number' || /^-?\d+.*$/.test(String(v).trim()));
}

function toNumber(v: unknown): number {
    return typeof v === 'string'
        ? parseFloat(v.replace(',', '.').replace(/[^0-9.-]+/g, ''))
        : Number(v);
}

/**
 * Use with sorting (arr.sort(fn))
 */
export function compareDifferentTypes<T>(a: T, b: T): number {
    const aIsNum = isNumber(a);
    const bIsNum = isNumber(b);
    if (aIsNum || bIsNum) {
        if (aIsNum && bIsNum) {
            return toNumber(a) - toNumber(b);
        } else if (aIsNum) {
            return -1;
        } else {
            return 1;
        }
    }
    return String(a).localeCompare(String(b));
}
