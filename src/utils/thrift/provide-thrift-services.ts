import Keycloak from 'keycloak-js';
import { isObject } from 'lodash-es';
import { combineLatest, map } from 'rxjs';
import { UnionToIntersection } from 'utility-types';

import { Type, inject, isDevMode, makeEnvironmentProviders } from '@angular/core';
import * as Sentry from '@sentry/angular';

import { ConnectOptions } from '@vality/domain-proto';

import { ConfigService, KeycloakUserService } from '~/services';

import { createProxyObject } from '../create-proxy-object';

import { createRequestWachterHeaders, createWachterHeaders } from './create-wachter-headers';

export const LOGGING = {
    fullLogging: isDevMode(),
};

export type ParsedThriftError = ReturnType<typeof parseThriftError>;

export function parseThriftError<T extends object>(error: unknown) {
    const traceId = error?.['info']?.headers?.['x-woody-trace-id'];

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
                traceId,
            } as const;
        case 'ThriftServiceNotFoundError':
            return {
                type: 'ThriftServiceNotFoundError',
                name: String(error?.['name']),
                message: String(error?.['message']),
                error,
                traceId,
            } as const;
        case 'ThriftServiceTimeoutError':
            return {
                type: 'ThriftServiceTimeoutError',
                name: String(error?.['name']),
                message: String(error?.['message']),
                error,
                traceId,
            } as const;
        default: {
            if (isObject(error))
                return {
                    type: 'UnknownError',
                    name: String(error?.['name']),
                    message: String(error?.['message']),
                    error,
                    traceId,
                } as const;
            return {
                type: 'UnknownError',
                name: String(error),
                message: String(error),
                error,
                traceId,
            } as const;
        }
    }
}

function addThriftErrorBreadcrumb(
    params: Parameters<NonNullable<ConnectOptions['loggingFn']>>[0],
    error: ParsedThriftError,
) {
    Sentry.addBreadcrumb({
        category: 'thrift',
        type: 'http',
        level: 'warning',
        message: `${params.name} (${params.namespace} ${params.serviceName}) failed: ${error.message || error.name || 'Unknown error'}`,
        data: {
            errorType: error.type,
            namespace: params.namespace,
            service: params.serviceName,
            method: params.name,
            ...(error.traceId ? { traceId: error.traceId } : {}),
        },
    });
}

function createLogger(keycloak: Keycloak): ConnectOptions['loggingFn'] {
    return (params) => {
        const info = `${params.name} (${params.namespace} ${params.serviceName})`;

        switch (params.type) {
            case 'error': {
                const parsedError = parseThriftError(params.error);
                addThriftErrorBreadcrumb(params, parsedError);
                if (params.error === 401) {
                    void keycloak.login();
                }
                console.groupCollapsed(
                    `🔴\u00A0${info}`,
                    `\n⚠️\u00A0${parsedError.message || parsedError.name || 'Unknown error'}`,
                    `\n🆔\u00A0Trace:\u00A0${params.headers['x-woody-trace-id']}`,
                );
                console.error(parsedError.error);
                if (LOGGING.fullLogging) {
                    console.dir(
                        {
                            Arguments: params.args,
                            Headers: params.headers,
                        },
                        {
                            depth: null,
                            compact: false,
                            maxArrayLength: null,
                            maxStringLength: null,
                        },
                    );
                }
                console.groupEnd();
                return;
            }
            case 'success': {
                if (LOGGING.fullLogging) {
                    console.groupCollapsed(`🟢\u00A0${info}`);
                    console.dir(
                        {
                            Arguments: params.args,
                            Response: params.response,
                            Headers: params.headers,
                        },
                        {
                            depth: null,
                            compact: false,
                            maxArrayLength: null,
                            maxStringLength: null,
                        },
                    );
                    console.groupEnd();
                }
                return;
            }
            case 'call': {
                return;
            }
        }
    };
}

function createConnectOptions(serviceName: string) {
    const configService = inject(ConfigService);
    const keycloak = inject(Keycloak);
    const keycloakUserService = inject(KeycloakUserService);
    const loggingFn = createLogger(keycloak);

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
                loggingFn,
                createCallOptions: () => ({
                    headers: {
                        ...createRequestWachterHeaders(),
                        authorization: `Bearer ${keycloak.token ?? ''}`,
                    },
                }),
                timeout: isDevMode() ? 15_000 : 60_000,
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
    const service = Symbol(serviceParams.name) as never as Type<T>;

    return {
        provider: {
            provide: service,
            useFactory: () => {
                const options$ = createConnectOptions(serviceParams.name);
                return createProxyObject(() =>
                    serviceParams.loader().then((mod) => new mod(options$) as object),
                );
            },
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
