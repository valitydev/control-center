import { ConnectOptions } from '@vality/woody/src/connect-options';
import pick from 'lodash-es/pick';
import { combineLatest, from } from 'rxjs';
import { first, map, shareReplay, switchMap, tap, catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
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

export class ThriftError extends Error {}

export class ThriftApi {
    private keycloakTokenInfoService = this.injector.get(KeycloakTokenInfoService);

    private connectOptions$ = combineLatest([
        this.keycloakTokenInfoService.decoded$,
        this.keycloakTokenInfoService.token$,
    ]).pipe(
        map(([{ email, sub: id, preferred_username: username }, token]) =>
            this.getConnectOptions({ email, id, username }, token)
        )
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
                tap(() => {
                    if (environment.logging.requests)
                        // eslint-disable-next-line no-console
                        console.info(
                            `📧 ${this.options.name}/${this.options.serviceName}/${methodName}`,
                            methodArgs
                        );
                }),
                switchMap(([connectOptions, methodOptions]) =>
                    callThriftServiceMethodWithConvert(
                        connectOptions,
                        methodOptions,
                        methodName,
                        methodArgs
                    )
                ),
                tap((res) => {
                    if (environment.logging.requests)
                        // eslint-disable-next-line no-console
                        console.info(
                            `📨 ${this.options.name}/${this.options.serviceName}/${methodName}`,
                            res
                        );
                }),
                catchError((err) => {
                    if (environment.logging.requests)
                        // eslint-disable-next-line no-console
                        console.info(
                            `😞 ${this.options.name}/${this.options.serviceName}/${methodName}`,
                            err
                        );
                    if (err === 403) {
                        throw new ThriftError('Access is denied');
                    }
                    throw err;
                })
            );
    }

    private getConnectOptions(
        userIdentityHeaderParams: Partial<UserIdentityHeaderParams>,
        token: string
    ): ThriftClientMainOptions & ConnectOptions {
        return {
            ...pick(this.options, 'hostname', 'port', 'service', 'deprecatedHeaders'),
            path: this.options.wachterServiceName ? '/wachter' : this.options.path,
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
