import { Pipe, PipeTransform } from '@angular/core';
import { ValueType, Field } from '@vality/thrift-ts';
import startCase from 'lodash-es/startCase';

import { getValueTypeTitle } from '@cc/app/shared';

@Pipe({
    name: 'fieldLabel',
})
export class FieldLabelPipe implements PipeTransform {
    transform(type: ValueType, field?: Field): string {
        return type ? startCase((field ? field.name : getValueTypeTitle(type)).toLowerCase()) : '';
    }
}
