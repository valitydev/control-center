export function unifyCsvItems<T>(
    csv: T[] | string[][],
    defaultProps: readonly (keyof T)[] | (keyof T)[],
): T[] {
    if (!Array.isArray(csv)) {
        return [];
    }
    if (Array.isArray(csv?.[0])) {
        return (csv as string[][]).map((d) =>
            Object.fromEntries(d.map((prop, idx) => [defaultProps[idx], prop])),
        ) as T[];
    }
    return csv as T[];
}
