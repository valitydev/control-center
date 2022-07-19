import { KeycloakService } from 'keycloak-angular';
import { combineLatest, from, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../../shared/services';
import { createThriftInstance, thriftInstanceToObject } from '../thrift-instance';
import { ThriftApiArgs } from './types/thrift-api-args';
import { ThriftApiOptions } from './types/thrift-api-options';
import { callThriftServiceMethod, toConnectOptions } from './utils';

export class ThriftApi {
    options: ThriftApiOptions;
    keycloakTokenInfoService: KeycloakTokenInfoService;
    keycloakService: KeycloakService;

    constructor(...[injector, options]: ThriftApiArgs) {
        this.keycloakTokenInfoService = injector.get(KeycloakTokenInfoService);
        this.keycloakService = injector.get(KeycloakService);
        this.options = options;
        this.initServiceMethods();
    }

    private initServiceMethods() {
        Object.assign(
            this,
            Object.fromEntries(
                this.options.functions.map((methodName) => [
                    methodName,
                    (...methodArgs) =>
                        from(this.options.metadata()).pipe(
                            switchMap((metadata) =>
                                this.callThriftServiceMethodWithConvert(
                                    this.options.name,
                                    this.options.serviceName,
                                    methodName,
                                    methodArgs,
                                    metadata,
                                    this.options.context
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
            createThriftInstance(
                metadata,
                context,
                namespaceName,
                methodMetadata.args[idx].type,
                arg
            )
        );
        return this.callThriftServiceMethod(methodName, ...methodThriftArgs).pipe(
            map((v) => thriftInstanceToObject(metadata, namespaceName, methodMetadata.type, v))
        );
    }

    private callThriftServiceMethod<T>(
        serviceMethodName: string,
        ...args: unknown[]
    ): Observable<T> {
        return combineLatest([
            this.keycloakTokenInfoService.decoded$,
            this.keycloakService.getToken(),
        ]).pipe(
            first(),
            switchMap(([parsedToken, token]) =>
                callThriftServiceMethod<T>(
                    {
                        hostname: this.options.hostname,
                        port: this.options.port,
                        service: this.options.service,
                        path: this.options.path,
                        ...toConnectOptions(
                            parsedToken,
                            this.options.wachterServiceName,
                            token,
                            this.options.deprecatedHeaders
                        ),
                    },
                    serviceMethodName,
                    args
                )
            )
        );
    }
}
