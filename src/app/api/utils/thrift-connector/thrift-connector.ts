import connectClient from '@vality/woody';
import { KeycloakService } from 'keycloak-angular';
import isNil from 'lodash-es/isNil';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { ThriftApiArgs } from '../create-thrift-api/types/thrift-api-args';
import { ThriftApiOptions } from '../create-thrift-api/types/thrift-api-options';
import { toConnectOptions } from './utils';

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
            switchMap(
                ([parsedToken, token]) =>
                    new Observable<T>((observer) => {
                        try {
                            /**
                             * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
                             * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
                             * TODO: Optimization option: add a connection pool.
                             */
                            const connection = connectClient(
                                this.options.hostname || location.hostname,
                                this.options.port || location.port,
                                this.options.path,
                                this.options.service,
                                toConnectOptions(
                                    parsedToken,
                                    this.options.wachterServiceName,
                                    token,
                                    this.options.deprecatedHeaders
                                ),
                                (err) => {
                                    observer.error(err);
                                    observer.complete();
                                }
                            );
                            const serviceMethod = connection[serviceMethodName];
                            if (isNil(serviceMethod)) {
                                observer.error(
                                    `Service method: "${serviceMethodName}" is not found in thrift client`
                                );
                                observer.complete();
                            } else {
                                serviceMethod.bind(connection)(...args, (err, result) => {
                                    if (err) observer.error(err);
                                    else observer.next(result);
                                    observer.complete();
                                });
                            }
                        } catch (err) {
                            observer.error(err);
                            observer.complete();
                        }
                    })
            )
        );
    }
}
