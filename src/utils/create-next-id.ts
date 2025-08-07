export function createNextId(ids: number[]) {
    return ids.length ? Math.max(...ids) + 1 : 1;
}
