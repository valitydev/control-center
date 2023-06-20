import { Pipe, PipeTransform } from '@angular/core';

import { skipNullValues } from '@cc/utils/skip-null-values';

@Pipe({
    name: 'ccJsonCleanLook',
})
export class JsonCleanLookPipe implements PipeTransform {
    transform(obj: unknown, isActive: boolean): unknown {
        return isActive ? skipNullValues(obj) : obj;
    }
}
