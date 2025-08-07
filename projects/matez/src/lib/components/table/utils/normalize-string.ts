export const SPACES = /[\s\u00A0]/g;

export function normalizeString(str: string) {
    return (str || '').replace(SPACES, ' ');
}
