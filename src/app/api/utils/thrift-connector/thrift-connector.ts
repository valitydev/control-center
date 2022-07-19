import { KeycloakService } from 'keycloak-angular';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { ThriftApiArgs } from '../create-thrift-api/types/thrift-api-args';
import { ThriftApiOptions } from '../create-thrift-api/types/thrift-api-options';
import { callThriftServiceMethod, toConnectOptions } from './utils';

export class ThriftConnector {
    keycloakTokenInfoService: KeycloakTokenInfoService;
    options: ThriftApiOptions;
    keycloakService: KeycloakService;

    constructor(...[injector, options]: ThriftApiArgs) {
        this.keycloakTokenInfoService = injector.get(KeycloakTokenInfoService);
        this.keycloakService = injector.get(KeycloakService);
        this.options = options;
    }

    protected callThriftServiceMethod<T>(
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
