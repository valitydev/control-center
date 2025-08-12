import startCase from 'lodash-es/startCase';

import { Field, ValueType } from '@vality/thrift-ts';

import { getValueTypeTitle } from '../value-type/get-value-type-title';

export function getFieldLabel(type: ValueType, field?: Field) {
    return type ? startCase((field ? field.name : getValueTypeTitle(type)).toLowerCase()) : '';
}
