import isNil from 'lodash-es/isNil';

export function unknownToString(value: unknown): string {
    if (isNil(value)) {
        return '';
    }
    return String(value);
}
