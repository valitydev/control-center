import isNil from 'lodash-es/isNil';

export function createUniqueColumnDef(name?: unknown) {
    return `___$$${
        typeof name === 'object' || isNil(name) ? 'column' : String(name)
    }_${Math.random().toString()}`;
}
