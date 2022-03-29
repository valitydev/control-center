import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { KeycloakTokenInfoService } from '../keycloak-token-info.service';
import { ConfigService } from './config.service';

const initializer = (
    keycloak: KeycloakService,
    configService: ConfigService,
    keycloakTokenInfoService: KeycloakTokenInfoService
) => () =>
    Promise.all([
        configService.load().then(() =>
            Promise.all([
                keycloak
                    .init({
                        config: '/assets/authConfig.json',
                        initOptions: {
                            onLoad: 'login-required',
                            checkLoginIframe: true,
                        },
                        enableBearerInterceptor: true,
                        bearerExcludedUrls: ['/assets', configService.config.fileStorageEndpoint],
                        bearerPrefix: 'Bearer',
                    })
                    .then(() => keycloak.getToken())
                    .then((token) => keycloakTokenInfoService.init(token)),
            ])
        ),
    ]);

@NgModule({
    imports: [CommonModule, HttpClientModule, KeycloakAngularModule],
    providers: [
        ConfigService,
        KeycloakTokenInfoService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializer,
            multi: true,
            deps: [KeycloakService, ConfigService, KeycloakTokenInfoService],
        },
    ],
})
export class CoreModule {}
