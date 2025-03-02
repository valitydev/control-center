import { ValueType } from '@vality/thrift-ts';

import { isComplexType } from '../thrift-type/is-complex-type';

export function typeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function getValueTypeTitle(valueType?: ValueType): string {
    if (!valueType) {
        return '';
    } else if (isComplexType(valueType)) {
        if (valueType.name === 'map') {
            return `${valueType.name}: ${getValueTypeTitle(
                valueType.keyType,
            )} - ${getValueTypeTitle(valueType.valueType)}`;
        }
        return `${valueType.name}: ${getValueTypeTitle(valueType.valueType)}`;
    }
    return typeCase(valueType);
}
