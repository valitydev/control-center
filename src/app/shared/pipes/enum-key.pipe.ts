import { Pipe, PipeTransform } from '@angular/core';
import { ValuesType } from 'utility-types';

import { getEnumKey } from '@cc/utils';

@Pipe({
    standalone: true,
    name: 'enumKey',
})
export class EnumKeyPipe implements PipeTransform {
    transform<E extends Record<PropertyKey, unknown>>(value: ValuesType<E>, enumObj: E): keyof E {
        return value && enumObj ? getEnumKey(enumObj, value) : '';
    }
}
