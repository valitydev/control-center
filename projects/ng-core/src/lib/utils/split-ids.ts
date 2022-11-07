const SEPARATORS = ',.;';

export function splitIds(ids: string): string[] {
    if (!ids) return [];
    return ids
        .split(new RegExp(`[${SEPARATORS}\\s]`))
        .map((id) => id.trim())
        .filter(Boolean);
}
