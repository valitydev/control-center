import { ValueType } from '@vality/thrift-ts';
import { ThriftData } from '../thrift-data';

import { getAliases } from './get-aliases';
import isEqual from 'lodash-es/isEqual';

export function getByType(data: ThriftData, type: ValueType, namespace: string): ThriftData | null {
    return data
        ? ([data, ...getAliases(data)].find(
              (d) => isEqual(d.type, type) && d.namespace === namespace,
          ) as ThriftData)
        : null;
}
