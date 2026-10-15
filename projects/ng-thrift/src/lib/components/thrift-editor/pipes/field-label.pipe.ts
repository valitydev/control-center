import { Pipe, PipeTransform } from '@angular/core';

import type { Field, ValueType } from '@vality/tsthrift';

import { getFieldLabel } from '../../../utils';

@Pipe({
    name: 'fieldLabel',
})
export class FieldLabelPipe implements PipeTransform {
    transform(type: ValueType, field?: Field): string {
        return getFieldLabel(type, field);
    }
}
