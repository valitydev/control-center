import { KeycloakService } from 'keycloak-angular';
import pick from 'lodash-es/pick';
import { combineLatest, from } from 'rxjs';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../../shared/services';
import { createThriftInstance, thriftInstanceToObject } from '../thrift-instance';
import { ThriftApiArgs } from './types/thrift-api-args';
import {
    callThriftServiceMethod,
    createAuthorizationHeaders,
    createDeprecatedUserIdentityHeaders,
    createUserIdentityHeaders,
    createWachterHeaders, ThriftClientMainOptions,
    UserIdentityHeaderParams
} from "./utils";
import { ConnectOptions } from "@vality/woody/src/connect-options";

export class ThriftApi {
    private connectOptions$ = combineLatest([
        this.injector.get(KeycloakTokenInfoService).decoded$,
        this.injector.get(KeycloakService).getToken(),
    ]).pipe(
        map(([{ email, sub: id, preferred_username: username }, token]) =>
            this.getConnectOptions({ email, id, username }, token)
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    constructor(private injector: ThriftApiArgs[0], private options: ThriftApiArgs[1]) {
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
                                this.callThriftServiceMethod(
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

    private callThriftServiceMethod(
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

        return this.connectOptions$.pipe(
            first(),
            switchMap((options) => callThriftServiceMethod(options, methodName, methodThriftArgs)),
            map((v) => thriftInstanceToObject(metadata, namespaceName, methodMetadata.type, v))
        );
    }

    private getConnectOptions(
        userIdentityHeaderParams: Partial<UserIdentityHeaderParams>,
        token: string
    ): ThriftClientMainOptions & ConnectOptions {
        return {
            ...pick(this.options, 'hostname', 'port', 'service', 'path', 'deprecatedHeaders'),
            headers: Object.assign(
                createUserIdentityHeaders(userIdentityHeaderParams),
                this.options.deprecatedHeaders &&
                    createDeprecatedUserIdentityHeaders(userIdentityHeaderParams),
                this.options.wachterServiceName && {
                    ...createWachterHeaders(this.options.wachterServiceName),
                    ...createAuthorizationHeaders(token),
                }
            ),
        };
    }
}
