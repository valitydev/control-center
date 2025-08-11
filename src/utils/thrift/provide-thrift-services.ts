import {
    EnvironmentProviders,
    FactoryProvider,
    Type,
    inject,
    isDevMode,
    makeEnvironmentProviders,
} from '@angular/core';
import { ConnectOptions } from '@vality/domain-proto';
import { toJson } from '@vality/ng-thrift';
import Keycloak from 'keycloak-js';
import { isObject } from 'lodash-es';
import { combineLatest, map } from 'rxjs';

import { ConfigService, KeycloakUserService } from '~/services';

import { createRequestWachterHeaders, createWachterHeaders } from './create-wachter-headers';

export const LOGGING = {
    fullLogging: isDevMode(),
};

export function parseThriftError<T extends object>(error: unknown) {
    switch (error?.['name']) {
        case 'ThriftServiceError':
            return {
                type: 'ThriftServiceError',
                name: String(error?.['error']?.name),
                message: String(error?.['error']?.message),
                details: Object.fromEntries(
                    Object.entries(error?.['error'] || {}).filter(
                        ([k, v]) => k !== 'name' && k !== 'message' && v,
                    ),
                ) as T,
                error: error?.['error'],
                wrapper: error,
            } as const;
        case 'ThriftServiceNotFoundError':
            return {
                type: 'ThriftServiceNotFoundError',
                name: String(error?.['name']),
                message: String(error?.['message']),
                error,
            } as const;
        case 'ThriftServiceTimeoutError':
            return {
                type: 'ThriftServiceTimeoutError',
                name: String(error?.['name']),
                message: String(error?.['message']),
                error,
            } as const;
        default: {
            if (isObject(error))
                return {
                    type: 'UnknownError',
                    name: String(error?.['name']),
                    message: String(error?.['message']),
                    error,
                } as const;
            return {
                type: 'UnknownError',
                name: String(error),
                message: String(error),
                error,
            } as const;
        }
    }
}

const logger: ConnectOptions['loggingFn'] = (params) => {
    const info = `${params.name} (${params.namespace} ${params.serviceName})`;

    switch (params.type) {
        case 'error': {
            const parsedError = parseThriftError(params.error);
            console.groupCollapsed(
                `🔴\u00A0${info}`,
                `\n⚠️\u00A0${parsedError.message || parsedError.name || 'Unknown error'}`,
                `\n🆔\u00A0Trace:\u00A0${params.headers['x-woody-trace-id']}`,
            );
            console.error(parsedError.error);
            if (LOGGING.fullLogging) {
                console.log('Arguments');
                console.log(JSON.stringify(toJson(params.args), null, 2));

                console.groupCollapsed('Headers');
                console.table(params.headers);
                console.groupEnd();
            }
            console.groupEnd();
            return;
        }
        case 'success': {
            if (LOGGING.fullLogging) {
                console.groupCollapsed(`🟢\u00A0${info}`);
                console.log('Arguments');
                console.log(JSON.stringify(toJson(params.args), null, 2));
                console.log('Response');
                console.log(JSON.stringify(toJson(params.response), null, 2));

                console.groupCollapsed('Headers');
                console.table(params.headers);
                console.groupEnd();
                console.groupEnd();
            }
            return;
        }
        case 'call': {
            return;
        }
    }
};

function provideThriftService<T extends Type<unknown>>(
    service: T,
    serviceName: string,
): FactoryProvider {
    return {
        provide: service,
        useFactory: () => {
            const configService = inject(ConfigService);
            const keycloak = inject(Keycloak);
            const keycloakUserService = inject(KeycloakUserService);

            return new service(
                combineLatest([keycloakUserService.user.value$, configService.config.value$]).pipe(
                    map(
                        ([user, config]): ConnectOptions => ({
                            headers: createWachterHeaders(serviceName, {
                                id: user.id,
                                email: user.email,
                                username: user.username,
                                token: keycloak.token ?? '',
                            }),
                            logging: true,
                            loggingFn: logger,
                            createCallOptions: () => ({
                                headers: createRequestWachterHeaders(),
                            }),
                            timeout: isDevMode() ? 10_000 : 60_000,
                            ...config.api.wachter,
                        }),
                    ),
                ),
            );
        },
    };
}

export function provideThriftServices(
    services: { service: Type<unknown>; name: string }[],
): EnvironmentProviders {
    return makeEnvironmentProviders(
        services.map((service) => provideThriftService(service.service, service.name)),
    );
}
