import { clean, isEmpty } from '@vality/ng-core';
import isObject from 'lodash-es/isObject';

function isEmptyThrift(value: unknown): boolean {
    if (isObject(value) && value.constructor === Object) {
        return false;
    }
    return isEmpty(value);
}

export function cleanThrift<T extends object>(obj: T) {
    return clean(obj, false, false, (v) => !isEmptyThrift(v));
}
