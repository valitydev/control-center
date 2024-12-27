import lodashIsEmpty from 'lodash-es/isEmpty';
import isObject from 'lodash-es/isObject';

import { isEmptyPrimitive } from './is-empty-primitive';

export function isEmpty(value: unknown): boolean {
    return isObject(value)
        ? value.constructor === Object ||
          Array.isArray(value) ||
          value instanceof Set ||
          value instanceof Map
            ? lodashIsEmpty(value)
            : false
        : isEmptyPrimitive(value);
}
