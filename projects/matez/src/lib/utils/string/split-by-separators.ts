const SEPARATORS = ',;';

export function splitBySeparators(ids: string, separators = SEPARATORS): string[] {
    if (!ids) {
        return [];
    }
    return ids
        .split(new RegExp(`[${separators}\\s]`))
        .map((id) => id.trim())
        .filter(Boolean);
}
