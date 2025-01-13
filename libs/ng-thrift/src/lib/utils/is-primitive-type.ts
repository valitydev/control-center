import type { ValueType, ThriftType } from '@vality/thrift-ts';

import { PRIMITIVE_TYPES } from '../types';

export function isPrimitiveType(type: ValueType): type is ThriftType {
    return PRIMITIVE_TYPES.includes(type as never);
}
