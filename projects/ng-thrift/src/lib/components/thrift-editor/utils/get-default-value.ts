import type { Metadata, ValueType } from '@vality/tsthrift';

import { ThriftData, TypeGroup } from '../../../models';

export function getDefaultValue(metadata: Metadata[], namespace: string, type: ValueType) {
    if (!type) {
        return null;
    }
    let data: ThriftData;
    do {
        data = new ThriftData(metadata, namespace, type);
        type = (data as ThriftData<ValueType, 'typedef'>).ast?.type;
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
