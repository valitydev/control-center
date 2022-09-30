import { Injectable } from '@angular/core';
import { Domain, DomainObject } from '@vality/domain-proto';
import { KeycloakService } from 'keycloak-angular';
import isNil from 'lodash-es/isNil';

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

    reduceDomain(domain: Domain): Domain {
        if (this.isDominantSecret) {
            return domain;
        }
        const result = new Map(domain);
        for (const [key, value] of result) {
            const found = EXCLUDE_OBJECTS.find((term) => value[term]);
            if (found) {
                result.set(key, reduceObject(found, value));
            }
        }
        return result;
    }

    restoreDomain(oldObject: DomainObject, newObject: DomainObject): DomainObject {
        if (this.isDominantSecret) {
            return newObject;
        }
        const found = EXCLUDE_OBJECTS.find((term) => oldObject[term]);
        if (found && !isNil(newObject[found]) && !isNil(oldObject[found].data.options)) {
            newObject[found].data.options = oldObject[found].data.options;
        }
        return newObject;
    }
}
