import { Injectable } from '@angular/core';
import { Domain, DomainObject } from '@vality/domain-proto/domain';
import { getUnionKey } from '@vality/ng-thrift';
import { KeycloakService } from 'keycloak-angular';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';

import { SECRETS_OBJECTS } from './consts/secrets-objects';
import { SECRETS_ROLE } from './consts/secrets-role';
import { isDominantSecretRole } from './utils/is-dominant-secret-role';
import { reduceObject } from './utils/reduce-object';

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
        if (!this.hasDominantSecretRole || SECRETS_OBJECTS.includes(getUnionKey(obj))) {
            return reduceObject(getUnionKey(obj), obj);
        }
        return obj;
    }

    reduceDomain(domain: Domain): Domain {
        if (this.hasDominantSecretRole) {
            return domain;
        }
        const result = new Map(domain);
        for (const [key, value] of result) {
            const found = SECRETS_OBJECTS.find((term) => value[term]);
            if (found) {
                result.set(key, reduceObject(found, value));
            }
        }
        return result;
    }

    restoreDomain(oldObject: DomainObject, newObject: DomainObject): DomainObject {
        if (this.hasDominantSecretRole) {
            return newObject;
        }
        let result = newObject;
        const found = SECRETS_OBJECTS.find((term) => oldObject[term]);
        if (found && !isNil(newObject[found]) && !isNil(oldObject[found].data.options)) {
            result = cloneDeep(newObject);
            const options = oldObject[found].data.options;
            result[found].data.options = cloneDeep(options);
        }
        return result;
    }
}
