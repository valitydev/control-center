import type { ValueType } from '@vality/tsthrift';

import { ThriftData } from '../thrift-data';

import { getByType } from './get-by-type';

export function isTypeWithAliases(data: ThriftData, type: ValueType, namespace: string): boolean {
    return Boolean(getByType(data, type, namespace));
}
