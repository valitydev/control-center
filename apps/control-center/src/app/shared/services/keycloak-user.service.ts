import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { KeycloakService } from 'keycloak-angular';
import { map } from 'rxjs';

import { KeycloakTokenInfoService } from './keycloak-token-info';

export interface KeycloakUser {
    email: string;
    username: string;
}

@Injectable({
    providedIn: 'root',
})
export class KeycloakUserService {
    private keycloakTokenInfoService = inject(KeycloakTokenInfoService);
    private keycloakService = inject(KeycloakService);
    user = rxResource({
        stream: () =>
            this.keycloakTokenInfoService.info$.pipe(
                map(
                    ({ email, preferred_username }): KeycloakUser => ({
                        email,
                        username: preferred_username,
                    }),
                ),
            ),
    });

    logout() {
        return this.keycloakService.logout();
    }
}
