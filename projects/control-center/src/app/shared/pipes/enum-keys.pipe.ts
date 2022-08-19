import { Pipe, PipeTransform } from '@angular/core';

import { getEnumKeys } from '@cc/utils';

@Pipe({
    standalone: true,
    name: 'enumKeys',
})
export class EnumKeysPipe implements PipeTransform {
    transform<E extends Record<PropertyKey, unknown>>(value: E): (keyof E)[] {
        return getEnumKeys(value);
    }
}
