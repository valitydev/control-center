import { Pipe, PipeTransform } from '@angular/core';

import { getUnionValue } from '../utils';

@Pipe({
    name: 'ngtUnionValue',
})
export class UnionValuePipe<T extends object> implements PipeTransform {
    public transform(union: T) {
        return getUnionValue(union);
    }
}
