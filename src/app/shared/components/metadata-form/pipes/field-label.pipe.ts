import { Pipe, PipeTransform } from '@angular/core';
import { getFieldLabel } from '@vality/ng-thrift';
import { ValueType, Field } from '@vality/thrift-ts';

@Pipe({
    name: 'fieldLabel',
})
export class FieldLabelPipe implements PipeTransform {
    transform(type: ValueType, field?: Field): string {
        return getFieldLabel(type, field);
    }
}
