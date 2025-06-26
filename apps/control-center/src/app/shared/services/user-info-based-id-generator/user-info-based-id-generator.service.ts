import { Injectable, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import short from 'short-uuid';

@Injectable()
export class UserInfoBasedIdGeneratorService {
    private keycloakService = inject(KeycloakService);

    getUsernameBasedId(): string {
        // TODO: replace it by id-generator after fix
        return `${this.getUsernameForId()}-${short().new()}`;
    }

    private getUsernameForId(): string {
        return this.keycloakService.getUsername().substr(0, 10);
    }
}
