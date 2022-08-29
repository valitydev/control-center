export class Columns<T extends readonly string[]> {
    list: T;
    def: { [N in T[number]]: N };

    constructor(...list: T) {
        this.list = list;
        this.def = Object.fromEntries(list.map((k) => [k, k])) as never;
    }
}
