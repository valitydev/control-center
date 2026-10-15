import { Pipe, PipeTransform } from '@angular/core';

import type { ValueType } from '@vality/tsthrift';

import { getValueTypeTitle } from '../utils';

@Pipe({
    standalone: true,
    name: 'ngtValueTypeTitle',
})
export class ValueTypeTitlePipe implements PipeTransform {
    transform(valueType?: ValueType): string {
        return getValueTypeTitle(valueType);
    }
}
