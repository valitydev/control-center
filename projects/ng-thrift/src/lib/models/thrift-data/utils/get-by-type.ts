import isEqual from 'lodash-es/isEqual';

import type { ValueType } from '@vality/tsthrift';

import { ThriftData } from '../thrift-data';

import { getAliases } from './get-aliases';

export function getByType(data: ThriftData, type: ValueType, namespace: string): ThriftData | null {
    return data
        ? ([data, ...getAliases(data)].find(
              (d) => isEqual(d.type, type) && d.namespace === namespace,
          ) as ThriftData)
        : null;
}
