import { Pipe, PipeTransform } from '@angular/core';

import { getUnionKey } from '../utils';

@Pipe({
    name: 'ngtMapUnion',
})
export class MapUnionPipe<T> implements PipeTransform {
    public transform(union: T, mapObject: { [N in keyof T]: string | number }) {
        return mapObject[getUnionKey(union)] as never;
    }
}
