import _isEmpty from 'lodash-es/isEmpty';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';

export function isEmpty(value: unknown): boolean {
    return isObject(value) ? _isEmpty(value) : isNil(value) || value === '';
}
