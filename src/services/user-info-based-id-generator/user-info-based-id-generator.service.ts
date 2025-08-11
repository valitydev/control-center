import Keycloak from 'keycloak-js';
import short from 'short-uuid';

import { Injectable, inject } from '@angular/core';

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
