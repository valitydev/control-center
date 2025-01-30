import { Field, ListType, MapType, SetType, ValueType } from '@vality/thrift-ts';

import { ThriftData, TypeGroup } from '../../../models';

export function getChildrenTypes(sourceData: ThriftData): {
    keyType?: ValueType;
    valueType?: ValueType;
    fields?: Field[];
} {
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
            if ((data as ThriftData<SetType | MapType | ListType>).type.name === 'map') {
                return {
                    keyType: (data as ThriftData<MapType>).type.keyType,
                    valueType: (data as ThriftData<MapType>).type.valueType,
                };
            }
            return {
                valueType: (data as ThriftData<SetType | ListType>).type.valueType,
            };
        }
    }
    return undefined;
}
