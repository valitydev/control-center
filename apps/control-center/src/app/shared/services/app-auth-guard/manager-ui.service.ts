import { Injectable, computed, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

import { KeycloakUserService } from '../keycloak-user.service';

const MANAGER_ROLE = 'ManagerTemp';
const MANAGER_ROLE_DELIMITER = '::';

@Injectable({ providedIn: 'root' })
export class ManagerUiService {
    private keycloakUserService = inject(KeycloakUserService);
    private keycloakService = inject(KeycloakService);

    isManagerUi = computed(() => (this.keycloakUserService.user.value() ? !!this.getRole() : null));
    partyId = computed(() => (this.keycloakUserService.user.value() ? this.getParty() : null));

    private getRole() {
        return this.keycloakService
            .getUserRoles(true)
            .find((role) => role.startsWith(MANAGER_ROLE));
    }

    private getParty() {
        return this.getRole()?.split(MANAGER_ROLE_DELIMITER)?.[1];
    }
}
