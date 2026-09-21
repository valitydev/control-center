import {
    AutoRefreshTokenService,
    UserActivityService,
    provideKeycloak,
    withAutoRefreshToken,
} from 'keycloak-angular';
import Keycloak, { KeycloakInitOptions } from 'keycloak-js';

import { inject, isDevMode, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';

const KEYCLOAK_SILENT_CHECK_SSO_OPTIONS: KeycloakInitOptions = {
    onLoad: 'check-sso',
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: new URL('silent-check-sso.html', document.baseURI).href,
    silentCheckSsoFallback: false,
};

export function provideAppAuth() {
    return makeEnvironmentProviders([
        provideKeycloak({
            config: './assets/authConfig.json' as never,
            providers: [AutoRefreshTokenService, UserActivityService],
        }),
        provideAppInitializer(async () => {
            const keycloak = inject(Keycloak);
            const development = isDevMode();

            withAutoRefreshToken({
                onInactivityTimeout: 'login',
                sessionTimeout: 4 * 60 * 60_000,
            }).configure();

            const authenticated = await keycloak.init({
                adapter: 'default',
                onLoad: 'login-required',
                ...(development ? KEYCLOAK_SILENT_CHECK_SSO_OPTIONS : {}),
            });

            if (!authenticated) {
                await keycloak.login();
            }
        }),
    ]);
}
