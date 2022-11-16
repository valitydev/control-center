/**
 * Use with sorting (arr.sort(fn))
 */
export function compareDifferentTypes<T>(a: T, b: T): number {
    return typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b));
}
