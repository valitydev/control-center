import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
    user = rxResource({
        loader: () =>
            this.keycloakTokenInfoService.info$.pipe(
                map(
                    ({ email, preferred_username }): KeycloakUser => ({
                        email,
                        username: preferred_username,
                    }),
                ),
            ),
    });

    constructor(private keycloakTokenInfoService: KeycloakTokenInfoService) {}
}
