import { from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { ThriftConnector } from '../thrift-connector';
import { createThriftInstance, thriftInstanceToObject } from '../thrift-instance';
import { ThriftApiArgs } from './types/thrift-api-args';

export class ThriftApi extends ThriftConnector {
    constructor(...[injector, options]: ThriftApiArgs) {
        super(
            injector.get(KeycloakTokenInfoService),
            options.service,
            options.endpoint,
            options.deprecatedHeaders
        );
        Object.assign(
            this,
            Object.fromEntries(
                options.functions.map((methodName) => [
                    methodName,
                    (...methodArgs) =>
                        from(options.metadata()).pipe(
                            switchMap((metadata) =>
                                this.callThriftServiceMethodWithConvert(
                                    options.name,
                                    options.serviceName,
                                    methodName,
                                    methodArgs,
                                    metadata,
                                    options.context
                                )
                            )
                        ),
                ])
            )
        );
    }

    private callThriftServiceMethodWithConvert(
        namespaceName: string,
        serviceName: string,
        methodName: string,
        methodArgs: any[],
        metadata: any,
        context: any
    ) {
        const methodMetadata = metadata.find((m) => m.name === namespaceName).ast.service[
            serviceName
        ].functions[methodName];
        const methodThriftArgs = methodArgs.map((arg, idx) =>
            createThriftInstance(metadata, context, namespaceName, methodMetadata.args[idx], arg)
        );
        return this.callThriftServiceMethod(methodName, ...methodThriftArgs).pipe(
            map((v) => thriftInstanceToObject(metadata, namespaceName, methodMetadata.type, v))
        );
    }
}
