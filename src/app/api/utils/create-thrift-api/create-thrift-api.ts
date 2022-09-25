import { Observable } from 'rxjs';

import { ThriftApi } from './thrift-api';
import { ThriftApiArgs } from './types/thrift-api-args';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WrappedThriftApi<T extends Record<PropertyKey, any>> = new (...args: ThriftApiArgs) => {
    [N in keyof T]: (
        ...args: Parameters<T[N]>
    ) => ReturnType<T[N]> extends Promise<infer R> ? Observable<R> : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createThriftApi<T extends Record<PropertyKey, any>>(): WrappedThriftApi<T> {
    return ThriftApi as never;
}
