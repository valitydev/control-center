import { Pipe, PipeTransform } from '@angular/core';

import { getUnionValue } from '@cc/utils/get-union-key';

@Pipe({
    name: 'ccUnionValue',
})
export class UnionValuePipe<T> implements PipeTransform {
    public transform(union: T) {
        return getUnionValue(union);
    }
}
