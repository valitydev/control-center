import connectClient from '@vality/woody';
import { ConnectOptions } from '@vality/woody/src/connect-options';
import isNil from 'lodash-es/isNil';
import { Observable } from 'rxjs';

export interface ThriftClientMainOptions {
    path: string;
    service: object;
    hostname?: string;
    port?: string;
}

const DEFAULT_CONNECT_OPTIONS: ConnectOptions = {
    deadlineConfig: {
        amount: 3,
        unitOfTime: 'm',
    },
};

export function callThriftServiceMethod<T>(
    { hostname, port, path, service, ...options }: ThriftClientMainOptions & ConnectOptions,
    serviceMethodName: string,
    serviceMethodArgs: unknown[] = []
): Observable<T> {
    return new Observable<T>((observer) => {
        try {
            /**
             * Connection errors come with HTTP errors (!= 200) and should be handled with errors from the service.
             * You need to have 1 free connection per request. Otherwise, the error cannot be caught or identified.
             * TODO: Optimization option: add a connection pool.
             */
            const connection = connectClient(
                hostname ?? location.hostname,
                port ?? location.port,
                path,
                service,
                { ...DEFAULT_CONNECT_OPTIONS, ...options },
                (err) => {
                    observer.error(err);
                    observer.complete();
                }
            );
            const serviceMethod = connection[serviceMethodName] as (...args: unknown[]) => unknown;
            if (isNil(serviceMethod)) {
                observer.error(
                    `Service method: "${serviceMethodName}" is not found in thrift client`
                );
                observer.complete();
            } else {
                serviceMethod.call(connection, ...serviceMethodArgs, (err, result: T) => {
                    if (err) observer.error(err);
                    else observer.next(result);
                    observer.complete();
                });
            }
        } catch (err) {
            observer.error(err);
            observer.complete();
        }
    });
}
