import { ConnectOptions } from '@vality/woody/src/connect-options';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    createThriftInstance,
    ThriftAstMetadata,
    ThriftInstanceContext,
    thriftInstanceToObject,
} from '../../thrift-instance';
import { callThriftServiceMethod, ThriftClientMainOptions } from './call-thrift-service-method';

interface ThriftServiceMethodOptions {
    namespaceName: string;
    serviceName: string;
    metadata: ThriftAstMetadata[];
    context: ThriftInstanceContext;
}

export function callThriftServiceMethodWithConvert<T>(
    connectOptions: ThriftClientMainOptions & ConnectOptions,
    { namespaceName, serviceName, metadata, context }: ThriftServiceMethodOptions,
    methodName: string,
    methodArgs: unknown[]
): Observable<T> {
    const methodMetadata = metadata.find((m) => m.name === namespaceName).ast.service[serviceName]
        .functions[methodName];
    const methodThriftArgs = methodArgs.map((arg, idx) =>
        createThriftInstance(metadata, context, namespaceName, methodMetadata.args[idx].type, arg)
    );
    return callThriftServiceMethod<T>(connectOptions, methodName, methodThriftArgs).pipe(
        map((v) => thriftInstanceToObject(metadata, namespaceName, methodMetadata.type, v))
    );
}
