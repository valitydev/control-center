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
import { map } from 'rxjs';

import {
    KeycloakTokenInfoService,
    createRequestWachterHeaders,
    createWachterHeaders,
} from '../../app/shared/services';
import { ConfigService } from '../../services';

const logger: ConnectOptions['loggingFn'] = (params) => {
    const info = `${params.name} (${params.namespace} ${params.serviceName})`;

    switch (params.type) {
        case 'error': {
            console.groupCollapsed(
                `🔴\u00A0${info}`,
                `\n🆔\u00A0Trace:\u00A0${params.headers['x-woody-trace-id']}`,
            );
            console.error(params.error);
            if (isDevMode()) {
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
            if (isDevMode()) {
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
            const keycloakTokenInfoService = inject(KeycloakTokenInfoService);
            const configService = inject(ConfigService);
            return new service(
                keycloakTokenInfoService.info$.pipe(
                    map(
                        (
                            kcInfo,
                        ): ConnectOptions & {
                            createCallOptions: () => ConnectOptions['headers'];
                        } => ({
                            headers: createWachterHeaders(serviceName, kcInfo),
                            logging: true,
                            loggingFn: logger,
                            createCallOptions: () => ({
                                headers: createRequestWachterHeaders(),
                            }),
                            ...configService.config.api.wachter,
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
