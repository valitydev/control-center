import startCase from 'lodash-es/startCase';
import { isPrimitive } from 'utility-types';

function renderList<T>(list: T[], renderItem: (v: T, idx: number) => string, isMore: boolean) {
    return list.length ? (isMore ? '…' : list.map(renderItem).join(', ')) : '';
}

function isObject(v: unknown): v is object {
    return (
        typeof v === 'object' &&
        !Array.isArray(v) &&
        !(v instanceof Map) &&
        !(v instanceof Set) &&
        v !== null
    );
}

export function inlineJson(
    value: unknown,
    maxReadableLever = 1,
    readableKeys = false,
    level = 0,
): string {
    const isRoot = (level = 0);
    if (isPrimitive(value)) {
        return String(value);
    }
    if (Array.isArray(value) || value instanceof Map || value instanceof Set) {
        const content = renderList(
            Array.from(value),
            (v) => inlineJson(v, maxReadableLever, readableKeys, level + 1),
            level > maxReadableLever,
        );
        if (value instanceof Set) {
            return `Set(${content})`;
        }
        if (value instanceof Map) {
            return `Map(${content})`;
        }
        return isRoot && content ? content : `[${content}]`;
    }
    const entries = Array.from(Object.entries(value as object));
    if (!entries.length) {
        return '{}';
    }
    const content = renderList(
        entries,
        ([k, v]) =>
            (readableKeys ? startCase(k) : k) +
            (isObject(v) && Object.keys(v).length <= 1 ? '/' : ': ') +
            inlineJson(v, maxReadableLever, readableKeys, level + 1),
        level > maxReadableLever,
    );
    if (isRoot || entries.length === 1) {
        return content;
    }
    return `{${content}}`;
}
