import { ConnectOptions } from '@vality/woody/src/connect-options';
import { KeycloakService } from 'keycloak-angular';
import pick from 'lodash-es/pick';
import { combineLatest, from } from 'rxjs';
import { first, map, shareReplay, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '../../../shared/services';
import { ThriftAstMetadata } from '../thrift-instance';
import { ThriftApiArgs } from './types/thrift-api-args';
import {
    callThriftServiceMethodWithConvert,
    createAuthorizationHeaders,
    createDeprecatedUserIdentityHeaders,
    createUserIdentityHeaders,
    createWachterHeaders,
    ThriftClientMainOptions,
    UserIdentityHeaderParams,
} from './utils';

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
    private methodOptions$ = from(this.options.metadata()).pipe(
        map((metadata) => ({
            metadata: metadata as ThriftAstMetadata[],
            namespaceName: this.options.name,
            ...pick(this.options, 'serviceName', 'context'),
        })),
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
                    this.createMethod(methodName),
                ])
            )
        );
    }

    private createMethod(methodName: string) {
        return (...methodArgs) =>
            combineLatest([this.connectOptions$, this.methodOptions$]).pipe(
                first(),
                switchMap(([connectOptions, methodOptions]) =>
                    callThriftServiceMethodWithConvert(
                        connectOptions,
                        methodOptions,
                        methodName,
                        methodArgs
                    )
                )
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
