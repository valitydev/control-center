import type { ValueType } from '@vality/tsthrift';

export function isComplexType(type: ValueType): type is Exclude<ValueType, string> {
    return typeof type === 'object';
}
