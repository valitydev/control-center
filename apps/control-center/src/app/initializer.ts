import { isDevMode } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { ConfigService } from '../services/config';

export const initializer = (keycloak: KeycloakService, configService: ConfigService) => () =>
    Promise.all([
        configService.load().then(() =>
            Promise.all([
                keycloak
                    .init({
                        config: environment.authConfigPath,
                        initOptions: {
                            onLoad: 'login-required',
                            checkLoginIframe: !isDevMode(),
                        },
                        enableBearerInterceptor: true,
                        bearerExcludedUrls: ['/assets'],
                        bearerPrefix: 'Bearer',
                    })
                    .then(() => keycloak.getToken()),
            ]),
        ),
    ]);
