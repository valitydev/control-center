import { Injectable } from '@angular/core';
import { DomainObject } from '@vality/domain-proto/lib/domain';

@Injectable()
export class ModifiedDomainObjectService {
    domainObject: DomainObject;

    update(domainObject: DomainObject) {
        this.domainObject = domainObject;
    }
}
