import { Pipe, PipeTransform } from '@angular/core';
import { Field, ValueType } from '@vality/thrift-ts';

import { getFieldLabel } from '../../../utils';

@Pipe({
    name: 'fieldLabel',
})
export class FieldLabelPipe implements PipeTransform {
    transform(type: ValueType, field?: Field): string {
        return getFieldLabel(type, field);
    }
}
