import type { ValueType } from '@vality/thrift-ts';

import { isComplexType } from './is-complex-type';
import { isPrimitiveType } from './is-primitive-type';

export interface NamespaceType<T extends ValueType = ValueType> {
    namespace: string;
    type: T;
}

export function parseNamespaceType<T extends ValueType>(
    type: T,
    namespace?: string,
): NamespaceType<T> {
    if (type && !isPrimitiveType(type) && !isComplexType(type) && type.includes('.')) {
        [namespace, type as unknown] = type.split('.');
    }
    return { namespace: namespace as string, type };
}
