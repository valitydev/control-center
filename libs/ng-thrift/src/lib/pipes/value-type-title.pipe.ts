import { Pipe, PipeTransform } from '@angular/core';
import { ValueType } from '@vality/thrift-ts';

import { getValueTypeTitle } from '../utils';

@Pipe({
    standalone: true,
    name: 'ngtValueTypeTitle',
})
export class ValueTypeTitlePipe implements PipeTransform {
    transform(valueType: ValueType): string {
        return getValueTypeTitle(valueType);
    }
}
