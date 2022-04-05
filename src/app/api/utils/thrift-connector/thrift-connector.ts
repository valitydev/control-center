import connectClient from '@vality/woody';
import isNil from 'lodash-es/isNil';
import { Observable } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { toConnectOptions, ThriftService } from './utils';

export class ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        protected service: ThriftService,
        protected endpoint: string,
        protected deprecatedHeaders = false
    ) {}

    protected callThriftServiceMethod<T>(
        serviceMethodName: string,
        ...args: unknown[]
    ): Observable<T> {
        return this.keycloakTokenInfoService.decoded$.pipe(
            first(),
            switchMap(
                (token) =>
                    new Observable<T>((observer) => {
                        try {
                            /**
                             * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
                             * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
                             * TODO: Optimization option: add a connection pool.
                             */
                            const connection = connectClient(
                                location.hostname,
                                location.port,
                                this.endpoint,
                                this.service,
                                toConnectOptions(token, this.deprecatedHeaders),
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
