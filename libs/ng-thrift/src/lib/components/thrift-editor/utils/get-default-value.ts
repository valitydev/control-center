import { ValueType } from '@vality/thrift-ts';
import { TypeDefs } from '@vality/thrift-ts/src/thrift-parser';
import { ValuesType } from 'utility-types';

import { ThriftData, TypeGroup } from '../../../models';
import { ThriftAstMetadata } from '../../../types';

export function getDefaultValue(metadata: ThriftAstMetadata[], namespace: string, type: ValueType) {
    if (!type) {
        return null;
    }
    let data: ThriftData;
    do {
        data = new ThriftData(metadata, namespace, type);
        type = (data.ast as never as ValuesType<TypeDefs>)?.type;
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
