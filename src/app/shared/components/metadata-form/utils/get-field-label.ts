import { Field, ValueType } from '@vality/thrift-ts';
import startCase from 'lodash-es/startCase';

import { getValueTypeTitle } from '../../../pipes';

export function getFieldLabel(type: ValueType, field?: Field) {
    return type ? startCase((field ? field.name : getValueTypeTitle(type)).toLowerCase()) : '';
}
