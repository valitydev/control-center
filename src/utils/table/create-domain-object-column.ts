import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { inject } from '@angular/core';

import { Reference } from '@vality/domain-proto/domain';
import { createColumn } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { DomainObjectsStoreService } from '~/api/domain-config';
import { SidenavInfoService } from '~/components/sidenav-info';
import { getDomainObjectDetails, getReferenceId } from '~/components/thrift-api-crud';
import { DomainObjectCardComponent } from '~/components/thrift-api-crud/domain';

export const createDomainObjectColumn = createColumn(({ ref }: { ref: Reference }) => {
    const sourceObj = {
        [getUnionKey(ref)]: { ref: getUnionValue(ref), data: {} },
    };
    const sidenavInfoService = inject(SidenavInfoService);
    const click = () => {
        sidenavInfoService.toggle(DomainObjectCardComponent, { ref });
    };
    console.log(ref);
    if (!ref || !getUnionValue(ref)) {
        return of({ value: '' });
    }
    return inject(DomainObjectsStoreService)
        .getLimitedObject(ref)
        .value$.pipe(
            map((obj) => ({
                value: obj.name || '',
                description: getReferenceId(obj.ref) || '',
                click,
            })),
            startWith({
                value: getDomainObjectDetails(sourceObj).label || '',
                description: getDomainObjectDetails(sourceObj).id || '',
                click,
                inProgress: true,
            }),
        );
});
