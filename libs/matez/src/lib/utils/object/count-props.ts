export function countProps(...objects: object[]): number {
    return objects.reduce((acc, obj) => acc + (obj ? Object.keys(obj).length : 0), 0);
}
