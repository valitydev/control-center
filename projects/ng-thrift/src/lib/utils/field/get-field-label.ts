import startCase from 'lodash-es/startCase';

import type { Field, ValueType } from '@vality/tsthrift';

import { getValueTypeTitle } from '../value-type/get-value-type-title';

export function getFieldLabel(type: ValueType, field?: Field) {
    return type ? startCase((field ? field.name : getValueTypeTitle(type)).toLowerCase()) : '';
}
