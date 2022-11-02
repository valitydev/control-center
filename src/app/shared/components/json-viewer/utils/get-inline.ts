import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

export function getInline(
    path: (string | number)[],
    value: unknown
): [(string | number)[], unknown] {
    if (isNil(value)) {
        return null;
    }
    if (isObject(value)) {
        const entries: [string, unknown][] = Object.entries(value);
        if (entries.length === 0) {
            return path.length > 1 ? [path.slice(0, -1), path.at(-1)] : [path, null];
        }
        if (entries.length === 1 && !(path.length === 1 && typeof path[0] === 'number')) {
            const [childKey, childValue] = entries[0];
            return getInline([...path, childKey], childValue);
        }
    }
    return [path, value];
}
