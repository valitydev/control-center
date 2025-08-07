import { Injectable, inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import short from 'short-uuid';

@Injectable()
export class UserInfoBasedIdGeneratorService {
    private keycloakService = inject(Keycloak);

    getUsernameBasedId(): string {
        return `${this.getUsernameForId()}-${short().new()}`;
    }

    private getUsernameForId(): string {
        return this.keycloakService.profile.username.substring(0, 10);
    }
}
