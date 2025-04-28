import { Enums } from '@vality/thrift-ts';
import { ValuesType } from 'utility-types';

import { ThriftData } from '../../models';

export function createThriftEnum<T>(...args: ConstructorParameters<typeof ThriftData>): T {
    const data = new ThriftData(...args);
    const enumItems = (data.ast as never as ValuesType<Enums>).items;
    return Object.fromEntries(enumItems.map(({ name, value }) => [name, value])) as T;
}
