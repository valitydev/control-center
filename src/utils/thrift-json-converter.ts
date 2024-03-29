import has from 'lodash-es/has';
import isObject from 'lodash-es/isObject';

import type { Int64 } from '@vality/thrift-ts';

import { clearNullFields } from './thrift-utils';

function resolveArray(arr: unknown[]): unknown[] {
    let result = [];
    for (const item of arr) {
        result = result.concat(toJson(item));
    }
    return result;
}

function resolveObject(obj: unknown): unknown {
    const sanitized = clearNullFields(obj);
    const entries = Object.entries(sanitized);
    let result = {};
    for (const [key, val] of entries) {
        result = {
            ...result,
            [key]: isObject(val) ? toJson(val) : val,
        };
    }
    return result;
}

function resolveMap(map: Map<unknown, unknown>): unknown {
    let result = [];
    map.forEach((v, k) => {
        result = result.concat({
            key: toJson(k),
            value: toJson(v),
        });
    });
    return result;
}

function isI64(obj: unknown): obj is Int64 {
    return has(obj, 'buffer') && has(obj, 'offset');
}

export function toJson(thrift: unknown): unknown {
    if (!thrift) {
        return;
    }
    if (Array.isArray(thrift)) {
        return resolveArray(thrift);
    }
    if (thrift instanceof Map) {
        return resolveMap(thrift);
    }
    if (isI64(thrift)) {
        return thrift.toNumber();
    }
    if (isObject(thrift)) {
        return resolveObject(thrift);
    }
    return thrift;
}
