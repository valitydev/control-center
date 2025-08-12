import isNil from 'lodash-es/isNil';
import { ValuesType } from 'utility-types';

import { Pipe, PipeTransform } from '@angular/core';

import { getEnumKey } from '../utils/enum';

@Pipe({
    standalone: true,
    name: 'enumKey',
})
export class EnumKeyPipe implements PipeTransform {
    transform<E extends Record<PropertyKey, unknown>>(value: ValuesType<E>, enumObj: E) {
        return !isNil(value) && enumObj ? getEnumKey(enumObj, value) : '';
    }
}
