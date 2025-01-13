import { Field, ValueType } from '@vality/thrift-ts';
import startCase from 'lodash-es/startCase';

import { getValueTypeTitle } from '../get-value-type-title';

export function getFieldLabel(type: ValueType, field?: Field) {
    return type ? startCase((field ? field.name : getValueTypeTitle(type)).toLowerCase()) : '';
}
