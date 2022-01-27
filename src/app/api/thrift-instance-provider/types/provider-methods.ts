import { ValueType } from '@vality/thrift-ts';

export interface ProviderMethods {
    toPlainObject<T>(indefiniteType: ValueType, thriftInstance: T): T;
    toThriftInstance<T>(indefiniteType: ValueType, plainObject: T): T;
}
