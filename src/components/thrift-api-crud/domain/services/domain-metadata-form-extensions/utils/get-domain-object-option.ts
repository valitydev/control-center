import { map } from 'rxjs';

import { inject } from '@angular/core';

import { LimitedVersionedObject, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { Option } from '@vality/matez';
import { getUnionValue } from '@vality/ng-thrift';

import { DomainService, getDomainObjectReference } from '~/api/domain-config';

import {
    getDomainObjectDetails,
    getLimitedDomainObjectDetails,
    getReferenceId,
} from '../../../utils';

export function getDomainObjectOption(obj: LimitedVersionedObject): Option {
    const details = getLimitedDomainObjectDetails(obj);
    let detailsObj: Option['details'];
    try {
        detailsObj = inject(DomainService)
            .get(obj.ref, obj.info.version)
            .pipe(map((o) => o.object));
    } catch (err) {
        console.warn(err);
        detailsObj = obj.ref;
    }
    return {
        value: getReferenceId(obj.ref),
        label: details.label,
        description: details.idDescription,
        details: detailsObj,
    };
}

export function getFullDomainObjectOption(obj: VersionedObject): Option {
    const details = getDomainObjectDetails(obj.object);
    return {
        value: getReferenceId(getDomainObjectReference(obj.object)),
        label: details.label,
        description: details.idDescription,
        details: getUnionValue(obj.object).data,
    };
}
