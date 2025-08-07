import { Pipe, PipeTransform } from '@angular/core';

import { getEnumKeyValues } from '../utils/enum';

@Pipe({
    standalone: true,
    name: 'enumKeyValues',
})
export class EnumKeyValuesPipe implements PipeTransform {
    transform<E extends Record<PropertyKey, unknown>>(value: E) {
        return getEnumKeyValues(value);
    }
}
