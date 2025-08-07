import { inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/domain';
import { createColumn } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { map, startWith } from 'rxjs/operators';

import { DomainObjectsStoreService } from '../../api/domain-config';
import { SidenavInfoService } from '../../app/shared/components/sidenav-info';
import {
    getDomainObjectDetails,
    getReferenceId,
} from '../../app/shared/components/thrift-api-crud';
import { DomainObjectCardComponent } from '../../app/shared/components/thrift-api-crud/domain2';

export const createDomainObjectColumn = createColumn(({ ref }: { ref: Reference }) => {
    const sourceObj = {
        [getUnionKey(ref)]: { ref: getUnionValue(ref), data: {} },
    };
    const sidenavInfoService = inject(SidenavInfoService);
    const click = () => {
        sidenavInfoService.toggle(DomainObjectCardComponent, { ref });
    };
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
