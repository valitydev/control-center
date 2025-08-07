import { ThriftData } from '../thrift-data';

import { getAliases } from './get-aliases';

export function getByType(data: ThriftData, type: string, namespace: string): ThriftData | null {
    return data
        ? ([data, ...getAliases(data)].find(
              (d) => d.type === type && d.namespace === namespace,
          ) as ThriftData)
        : null;
}
