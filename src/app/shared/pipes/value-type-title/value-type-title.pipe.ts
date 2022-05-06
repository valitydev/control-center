import { Pipe, PipeTransform } from '@angular/core';
import { ValueType } from '@vality/thrift-ts';
import lowerCase from 'lodash-es/lowerCase';

import { isComplexType } from '@cc/app/api/utils';

@Pipe({
    name: 'valueTypeTitle',
})
export class ValueTypeTitlePipe implements PipeTransform {
    transform(valueType: ValueType): string {
        return this.getTypeName(valueType);
    }

    private getTypeName(valueType: ValueType): string {
        if (isComplexType(valueType)) {
            if (valueType.name === 'map') {
                return `${valueType.name}: ${this.getTypeName(
                    valueType.keyType
                )} - ${this.getTypeName(valueType.valueType)}`;
            }
            return `${valueType.name}: ${this.getTypeName(valueType.valueType)}`;
        }
        return lowerCase(valueType);
    }
}
