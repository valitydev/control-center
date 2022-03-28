import { Observable } from 'rxjs';

import { ThriftApi } from './thrift-api';
import { ThriftApiArgs } from './types/thrift-api-args';

export function createThriftApi<T extends Record<PropertyKey, any>>() {
    return ThriftApi as unknown as new (...args: ThriftApiArgs) => {
        [N in keyof T]: (
            ...args: Parameters<T[N]>
        ) => ReturnType<T[N]> extends Promise<infer R> ? Observable<R> : never;
    };
}
