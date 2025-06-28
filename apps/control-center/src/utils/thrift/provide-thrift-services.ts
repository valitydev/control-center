import {
    EnvironmentProviders,
    FactoryProvider,
    Type,
    inject,
    makeEnvironmentProviders,
} from '@angular/core';
import { map } from 'rxjs';

import { ConfigService } from '../../app/core/config.service';
import { KeycloakTokenInfoService, toWachterHeaders } from '../../app/shared/services';

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
                    map((kcInfo) => ({
                        headers: toWachterHeaders(serviceName)(kcInfo),
                        logging: true,
                        ...configService.config.api.wachter,
                    })),
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
