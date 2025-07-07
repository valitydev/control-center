import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { initializer } from '../initializer';

import { ConfigService } from './config.service';

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
