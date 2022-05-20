import { Pipe, PipeTransform } from '@angular/core';
import { ValueType } from '@vality/thrift-ts';

import { getValueTypeTitle } from './utils/get-value-type-title';

@Pipe({
    name: 'valueTypeTitle',
})
export class ValueTypeTitlePipe implements PipeTransform {
    transform(valueType: ValueType): string {
        return getValueTypeTitle(valueType);
    }
}
