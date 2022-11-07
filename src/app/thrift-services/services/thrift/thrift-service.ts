import { NgZone, Injector } from '@angular/core';
import connectClient from '@vality/woody';
import { Observable, combineLatest, switchMap } from 'rxjs';
import { timeout, first } from 'rxjs/operators';

import {
    createWachterHeaders,
    createAuthorizationHeaders,
} from '../../../api/utils/create-thrift-api/utils';
import { KeycloakTokenInfoService, KeycloakToken } from '../../../shared/services';

type Exception<N = string, T = any> = {
    name: N;
    message: string;
} & T;

export class ThriftService {
    protected realm = 'internal';
    private keycloakTokenInfoService = this.injector.get(KeycloakTokenInfoService);
    private zone = this.injector.get(NgZone);

    constructor(
        private injector: Injector,
        protected endpoint: string,
        protected service: any,
        private wachterServiceName?: string
    ) {}

    protected toObservableAction<T extends (...A: any[]) => Observable<any>>(
        name: string,
        deprecatedHeaders = true
    ): T {
        return ((...args) =>
            combineLatest([
                this.keycloakTokenInfoService.decoded$,
                this.keycloakTokenInfoService.token$,
            ]).pipe(
                first(),
                switchMap(
                    ([data, tokenData]) =>
                        new Observable<any>((observer) => {
                            const cb = (msg) => {
                                observer.error(msg);
                                observer.complete();
                            };
                            this.zone.run(() => {
                                try {
                                    const client = this.createClient(
                                        cb,
                                        deprecatedHeaders,
                                        tokenData,
                                        data
                                    );
                                    client[name](...args, (ex: Exception, result) => {
                                        if (ex) observer.error(ex);
                                        else observer.next(result);
                                        observer.complete();
                                    });
                                } catch (e) {
                                    cb(e);
                                }
                            });
                        })
                ),
                timeout(60000 * 3)
            )) as any;
    }

    private createClient(
        errorCb: (cb: () => void) => void,
        deprecatedHeaders: boolean,
        token: string,
        tokenData: KeycloakToken
    ) {
        const { email, preferred_username, sub } = tokenData;
        return connectClient(
            location.hostname,
            location.port,
            this.endpoint,
            this.service,
            {
                headers: {
                    'woody.meta.user-identity.email': email,
                    'woody.meta.user-identity.realm': this.realm,
                    'woody.meta.user-identity.username': preferred_username,
                    'woody.meta.user-identity.id': sub,
                    ...(deprecatedHeaders
                        ? {
                              'x-rbk-meta-user-identity.email': email,
                              'x-rbk-meta-user-identity.realm': this.realm,
                              'x-rbk-meta-user-identity.username': preferred_username,
                              'x-rbk-meta-user-identity.id': sub,
                          }
                        : undefined),
                    ...(this.wachterServiceName
                        ? {
                              ...createWachterHeaders(this.wachterServiceName),
                              ...createAuthorizationHeaders(token),
                          }
                        : {}),
                },
                // deadlineConfig: {
                //     amount: 3,
                //     unitOfTime: 'm',
                // },
                deprecatedHeaders,
            },
            errorCb
        );
    }
}
