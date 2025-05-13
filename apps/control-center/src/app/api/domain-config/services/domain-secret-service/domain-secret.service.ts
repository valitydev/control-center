import { Injectable } from '@angular/core';
import { Domain, DomainObject } from '@vality/domain-proto/domain';
import { KeycloakService } from 'keycloak-angular';

import { SECRETS_ROLE } from './consts/secrets-role';
import { isDominantSecretRole } from './utils/is-dominant-secret-role';
import { reduceObject } from './utils/reduce-object';
import { restoreObject } from './utils/restore-object';

@Injectable({
    providedIn: 'root',
})
export class DomainSecretService {
    private hasDominantSecretRole = isDominantSecretRole(
        this.keycloakService.getUserRoles(),
        SECRETS_ROLE,
    );

    constructor(private keycloakService: KeycloakService) {}

    reduceObject(obj: DomainObject): DomainObject {
        if (this.hasDominantSecretRole) {
            return obj;
        }
        return reduceObject(obj);
    }

    reduceDomain(domain: Domain): Domain {
        if (this.hasDominantSecretRole) {
            return domain;
        }
        const resDomain: Domain = new Map();
        for (const [name, value] of resDomain) {
            resDomain.set(name, reduceObject(value));
        }
        return resDomain;
    }

    restoreDomain(srcObj: DomainObject, newObj: DomainObject): DomainObject {
        if (this.hasDominantSecretRole) {
            return newObj;
        }
        return restoreObject(srcObj, newObj);
    }
}
