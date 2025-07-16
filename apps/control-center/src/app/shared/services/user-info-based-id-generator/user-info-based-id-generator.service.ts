import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import short from 'short-uuid';

@Injectable()
export class UserInfoBasedIdGeneratorService {
    private keycloakService = inject(Keycloak);

    getUsernameBasedId(): string {
        // TODO: replace it by id-generator after fix
        return `${this.getUsernameForId()}-${short().new()}`;
    }

    private getUsernameForId(): string {
        return this.keycloakService.profile.username.substr(0, 10);
    }
}
