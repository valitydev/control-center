import { ValueType, Field, SetType, MapType, ListType } from '@vality/thrift-ts';

import { MetadataFormData, TypeGroup } from '../../metadata-form';

export function getChildrenTypes(sourceData: MetadataFormData): {
    keyType?: ValueType;
    valueType?: ValueType;
    fields?: Field[];
} {
    const data = sourceData.trueTypeNode.data;
    switch (data.typeGroup) {
        case TypeGroup.Object: {
            switch (data.objectType) {
                case 'struct':
                    return { fields: (data as MetadataFormData<ValueType, 'struct'>).ast };
                case 'union':
                    return { fields: (data as MetadataFormData<ValueType, 'union'>).ast };
            }
            return;
        }
        case TypeGroup.Complex: {
            if ((data as MetadataFormData<SetType | MapType | ListType>).type.name === 'map') {
                return {
                    keyType: (data as MetadataFormData<MapType>).type.keyType,
                    valueType: (data as MetadataFormData<MapType>).type.valueType,
                };
            }
            return {
                valueType: (data as MetadataFormData<SetType | ListType>).type.valueType,
            };
        }
    }
}
