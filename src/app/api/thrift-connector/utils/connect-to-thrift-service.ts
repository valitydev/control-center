import connectClient from '@vality/woody';
import { ConnectOptions } from '@vality/woody/src/connect-options';
import { Observable } from 'rxjs';

import { ThriftService, ThriftServiceConnection } from './types';

export const connectToThriftService = (
    endpoint: string,
    service: ThriftService,
    connectionOptions: ConnectOptions,
    hostname: string = location.hostname,
    port: string = location.port
): Observable<ThriftServiceConnection> =>
    new Observable((observer) => {
        const connection = connectClient(
            hostname,
            port,
            endpoint,
            service,
            connectionOptions,
            (err) => {
                observer.error(err);
                observer.complete();
            }
        );
        observer.next(connection);
        observer.complete();
    });
