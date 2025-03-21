import { Pipe, PipeTransform } from '@angular/core';

import { getUnionKey } from '../utils';

@Pipe({
    name: 'ngtUnionKey',
    standalone: false,
})
export class UnionKeyPipe<T> implements PipeTransform {
    public transform(union: T) {
        return getUnionKey(union);
    }
}
