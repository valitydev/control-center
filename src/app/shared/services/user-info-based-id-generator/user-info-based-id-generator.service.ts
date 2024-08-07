import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import short from 'short-uuid';

@Injectable()
export class UserInfoBasedIdGeneratorService {
    constructor(private keycloakService: KeycloakService) {}

    getUsernameBasedId(): string {
        // TODO: replace it by id-generator after fix
        return `${this.getUsernameForId()}-${short().new()}`;
    }

    private getUsernameForId(): string {
        return this.keycloakService.getUsername().substr(0, 10);
    }
}
