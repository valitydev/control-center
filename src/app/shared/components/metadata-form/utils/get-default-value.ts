import { ThriftAstMetadata } from '@vality/domain-proto';
import { ValueType } from '@vality/thrift-ts';
import { TypeDefs } from '@vality/thrift-ts/src/thrift-parser';

import { MetadataFormData, TypeGroup } from '../types/metadata-form-data';

export function getDefaultValue(metadata: ThriftAstMetadata[], namespace: string, type: ValueType) {
    let data: MetadataFormData;
    do {
        data = new MetadataFormData(metadata, namespace, type);
        type = (data.ast as TypeDefs[string])?.type;
    } while (data.objectType === 'typedef');
    switch (data.typeGroup) {
        case TypeGroup.Complex: {
            switch (data.type) {
                case 'map':
                    return new Map();
                case 'set':
                    return new Set();
                case 'list':
                    return [];
            }
            return null;
        }
        case TypeGroup.Object:
            return {};
        case TypeGroup.Primitive:
        default:
            return null;
    }
}
