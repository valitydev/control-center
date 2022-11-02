import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

export function getInline(
    path: (string | number)[],
    value: unknown
): [(string | number)[], unknown] {
    if (isNil(value)) {
        return null;
    }
    if (isObject(value) && !(path.length === 1 && typeof path[0] === 'number')) {
        const entries: [string, unknown][] = Object.entries(value).filter(([, v]) => !isNil(v));
        if (entries.length === 0) {
            return [path, null];
        }
        if (entries.length === 1) {
            const [childKey, childValue] = entries[0];
            return getInline([...path, childKey], childValue);
        }
    }
    return [path, value];
}
