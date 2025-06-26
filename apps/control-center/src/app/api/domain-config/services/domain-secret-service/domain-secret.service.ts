import { Injectable, inject } from '@angular/core';
import { Domain, DomainObject } from '@vality/domain-proto/domain';

import { AppAuthGuardService } from '../../../../shared/services';

import { SECRETS_ROLE } from './consts/secrets-role';
import { reduceObject } from './utils/reduce-object';
import { restoreObject } from './utils/restore-object';

@Injectable({
    providedIn: 'root',
})
export class DomainSecretService {
    private appAuthGuardService = inject(AppAuthGuardService);
    private hasDominantSecretRole = this.appAuthGuardService.userHasRoles([SECRETS_ROLE]);

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
        for (const [name, value] of domain) {
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
