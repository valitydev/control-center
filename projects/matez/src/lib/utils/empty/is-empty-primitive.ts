import isNil from 'lodash-es/isNil';

export function isEmptyPrimitive(value: unknown): boolean {
    return isNil(value) || value === '';
}
