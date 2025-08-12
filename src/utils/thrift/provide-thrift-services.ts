import Keycloak from 'keycloak-js';
import { isObject } from 'lodash-es';
import { combineLatest, map } from 'rxjs';
import { UnionToIntersection } from 'utility-types';

import { Type, inject, isDevMode, makeEnvironmentProviders } from '@angular/core';

import { ConnectOptions } from '@vality/domain-proto';
import { toJson } from '@vality/ng-thrift';

import { ConfigService, KeycloakUserService } from '~/services';

import { createProxyObject } from '../create-proxy-object';

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

function createConnectOptions(serviceName: string) {
    const configService = inject(ConfigService);
    const keycloak = inject(Keycloak);
    const keycloakUserService = inject(KeycloakUserService);

    return combineLatest([keycloakUserService.user.value$, configService.config.value$]).pipe(
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
    );
}

export interface ThriftService<T = unknown> {
    name: string;
    loader: () => Promise<Type<T>>;
}

export function createThriftService<T>(serviceParams: ThriftService<T>) {
    const options$ = createConnectOptions(serviceParams.name);
    const service = Symbol(serviceParams.name) as never as Type<T>;

    return {
        provider: {
            provide: serviceParams,
            useFactory: () =>
                createProxyObject(() =>
                    serviceParams.loader().then((mod) => new mod(options$) as object),
                ),
        },
        service,
    };
}

export function createThriftServices<T extends readonly ThriftService[]>(
    servicesParams: T,
): {
    provideThriftServices: () => ReturnType<typeof makeEnvironmentProviders>;
    services: UnionToIntersection<
        {
            [K in keyof T]: Record<
                T[K]['name'],
                T[K] extends ThriftService<infer U> ? Type<U> : never
            >;
        }[number]
    >;
} {
    const services = servicesParams.map((service) => createThriftService(service));

    return {
        provideThriftServices: () => makeEnvironmentProviders(services.map((s) => s.provider)),
        services: Object.fromEntries(
            services.map((s, idx) => [servicesParams[idx].name, s.service]),
        ) as never,
    };
}
