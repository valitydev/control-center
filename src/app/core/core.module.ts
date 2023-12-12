import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { environment } from '../../environments/environment';

import { ConfigService } from './config.service';

const initializer = (keycloak: KeycloakService, configService: ConfigService) => () =>
    Promise.all([
        configService.load().then(() =>
            Promise.all([
                keycloak
                    .init({
                        config: environment.authConfigPath,
                        initOptions: {
                            onLoad: 'login-required',
                            checkLoginIframe: true,
                        },
                        enableBearerInterceptor: true,
                        bearerExcludedUrls: ['/assets'],
                        bearerPrefix: 'Bearer',
                    })
                    .then(() => keycloak.getToken()),
            ]),
        ),
    ]);

@NgModule({
    imports: [CommonModule, HttpClientModule, KeycloakAngularModule],
    providers: [
        ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializer,
            multi: true,
            deps: [KeycloakService, ConfigService],
        },
    ],
})
export class CoreModule {}
