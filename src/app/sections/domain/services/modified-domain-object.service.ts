import { Injectable } from '@angular/core';
import { DomainObject } from '@vality/domain-proto/domain';

@Injectable()
export class ModifiedDomainObjectService {
    domainObject: DomainObject;
    ref: string;

    update(domainObject: DomainObject, ref: string) {
        this.domainObject = domainObject;
        this.ref = ref;
    }
}
