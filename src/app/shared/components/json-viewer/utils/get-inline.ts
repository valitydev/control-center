import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

export function getInline(path: string[], value: unknown): [string[], unknown] {
    if (isNil(value)) {
        return null;
    }
    if (isObject(value)) {
        const entries: [string, unknown][] = Object.entries(value).filter(([, v]) => !isNil(v));
        if (entries.length === 1) {
            const [childKey, childValue] = entries[0];
            return getInline([...path, childKey], childValue);
        }
    }
    return [path, value];
}
