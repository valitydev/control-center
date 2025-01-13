import type { ValueType, SetType, ListType, MapType } from '@vality/thrift-ts';

export function isComplexType(type: ValueType): type is SetType | ListType | MapType {
    return typeof type === 'object';
}
