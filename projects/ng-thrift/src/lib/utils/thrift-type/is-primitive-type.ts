import type { ValueType } from '@vality/tsthrift';

import { PRIMITIVE_TYPES, type PrimitiveType } from '../../types';

export function isPrimitiveType(type: ValueType): type is PrimitiveType {
    return PRIMITIVE_TYPES.includes(type as never);
}
