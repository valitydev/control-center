import { isPrimitive } from 'utility-types';

export function inlineJson(value: unknown, maxReadableLever = 1): string {
    if (value === '') {
        return "''";
    }
    if (isPrimitive(value)) {
        return String(value);
    }
    if (Array.isArray(value) || value instanceof Map || value instanceof Set) {
        const content =
            maxReadableLever > 0
                ? Array.from(value)
                      .map((v) => inlineJson(v, maxReadableLever))
                      .join(', ')
                : Array.from(value).length
                ? '…'
                : '';
        if (value instanceof Set) return ['Set(', content, ')'].filter(Boolean).join('');
        if (value instanceof Map) return ['Map(', content, ')'].filter(Boolean).join('');
        return ['[', content, ']'].filter(Boolean).join('');
    }
    const content =
        maxReadableLever > 0
            ? ' ' +
              Object.entries(value as never)
                  .map(([k, v]) => `${k}: ${inlineJson(v, maxReadableLever - 1)}`)
                  .join(', ') +
              ' '
            : '';
    return ['{', content, '}'].filter(Boolean).join('');
}
