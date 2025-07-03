import { inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/internal/domain';
import { createColumn } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { map, startWith } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../components/sidenav-info';
import { getDomainObjectDetails } from '../../components/thrift-api-crud';
import { DomainObjectCardComponent } from '../../components/thrift-api-crud/domain2';

export const createDomainObjectColumn = createColumn(({ ref }: { ref: Reference }) => {
    const sourceObj = {
        [getUnionKey(ref)]: { ref: getUnionValue(ref), data: {} },
    };
    const sidenavInfoService = inject(SidenavInfoService);
    const click = () => {
        sidenavInfoService.toggle(DomainObjectCardComponent, { ref });
    };
    return inject(DomainStoreService)
        .getObject(ref)
        .pipe(
            map((obj) => ({
                value: getDomainObjectDetails(obj).label || '',
                description: getDomainObjectDetails(obj).id || '',
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
