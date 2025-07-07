import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, inject, provideAppInitializer } from '@angular/core';
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
    imports: [CommonModule, KeycloakAngularModule],
    providers: [
        ConfigService,
        provideAppInitializer(() => {
            const initializerFn = initializer(inject(KeycloakService), inject(ConfigService));
            return initializerFn();
        }),
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class CoreModule {}
