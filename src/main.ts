import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { KeycloakService } from 'keycloak-angular';

import { AppModule, AppInjector } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

// Window utils
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention,no-console */
Object.assign(window as any, {
    ccSwitchLogging() {
        const newState = !environment.logging.requests;
        environment.logging = {
            requests: newState,
        };
        console.log(`Logging ${newState ? 'enabled' : 'disabled'}`);
    },
    ccGetMyRoles() {
        console.log(AppInjector.get(KeycloakService).getUserRoles(true).sort().join('\n'));
    },
});
/* eslint-enable @typescript-eslint/naming-convention,no-console */

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
