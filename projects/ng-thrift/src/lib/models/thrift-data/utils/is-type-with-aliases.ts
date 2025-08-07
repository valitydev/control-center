import { ThriftData } from '../thrift-data';

import { getByType } from './get-by-type';

export function isTypeWithAliases(data: ThriftData, type: string, namespace: string): boolean {
    return Boolean(getByType(data, type, namespace));
}
