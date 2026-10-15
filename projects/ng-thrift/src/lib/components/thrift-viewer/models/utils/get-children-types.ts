import type { Field, ValueType } from '@vality/tsthrift';

import { ThriftData, TypeGroup } from '../../../../models';
import { isComplexType } from '../../../../utils';

interface ChildrenTypes {
    keyType?: ValueType;
    valueType?: ValueType;
    fields?: Field[];
}

export function getChildrenTypes(sourceData: ThriftData): ChildrenTypes | undefined {
    const data = sourceData.trueTypeNode.data;
    switch (data.typeGroup) {
        case TypeGroup.Object: {
            switch (data.objectType) {
                case 'struct':
                    return { fields: (data as ThriftData<ValueType, 'struct'>).ast };
                case 'union':
                    return { fields: (data as ThriftData<ValueType, 'union'>).ast };
            }
            return undefined;
        }
        case TypeGroup.Complex: {
            const type = data.type;
            if (!isComplexType(type)) {
                return undefined;
            }
            if (type.name === 'map') {
                return {
                    keyType: type.keyType,
                    valueType: type.valueType,
                };
            }
            return {
                valueType: type.valueType,
            };
        }
    }
    return undefined;
}
