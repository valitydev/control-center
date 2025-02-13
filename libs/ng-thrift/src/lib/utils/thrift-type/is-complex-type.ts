import type { ListType, MapType, SetType, ValueType } from '@vality/thrift-ts';

export function isComplexType(type: ValueType): type is SetType | ListType | MapType {
    return typeof type === 'object';
}
