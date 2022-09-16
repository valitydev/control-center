import { Injectable } from '@angular/core';
import { Snapshot } from '@vality/domain-proto/lib/domain_config';
import { KeycloakService } from 'keycloak-angular';

import { isDominantSecretRole } from './is-dominant-secret-role';
import { reduceObject } from './reduce-object';

const DOMINANT_SECRETS_ROLE = 'dominant:secrets';
const EXCLUDE_OBJECTS = ['terminal', 'provider', 'proxy'];

@Injectable({
    providedIn: 'root',
})
export class DomainSecretService {
    private isDominantSecret = isDominantSecretRole(
        this.keycloakService.getUserRoles(),
        DOMINANT_SECRETS_ROLE
    );

    constructor(private keycloakService: KeycloakService) {}

    reduceSnapshot(snapshot: Snapshot): Snapshot {
        if (this.isDominantSecret) {
            return snapshot;
        }
        for (const [key, value] of snapshot.domain) {
            const found = EXCLUDE_OBJECTS.find((term) => value[term]);
            if (found) {
                snapshot.domain.set(key, reduceObject(found, value));
            }
        }
        return snapshot;
    }
}
