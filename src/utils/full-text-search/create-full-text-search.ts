import Fuse from 'fuse.js';

export function createFullTextSearch<T extends object, O extends object>(
    source: T[],
    objects: O[],
    options: Fuse.IFuseOptions<O> = { keys: Object.keys(objects[0]) },
) {
    const fuse = new Fuse(objects, options);
    return {
        search: (str: string) => (str ? fuse.search(str).map((r) => source[r.refIndex]) : source),
    };
}
