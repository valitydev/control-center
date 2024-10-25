import { inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/internal/domain';
import { createColumn } from '@vality/ng-core';
import { getUnionValue, getUnionKey } from '@vality/ng-thrift';
import { map, startWith } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../components/sidenav-info';
import {
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '../../components/thrift-api-crud';

export const createDomainObjectColumn = createColumn(({ ref }: { ref: Reference }) => {
    const sourceObj = {
        [getUnionKey(ref)]: { ref: getUnionValue(ref), data: {} },
    };
    return inject(DomainStoreService)
        .getObject(ref)
        .pipe(
            map((obj) => ({
                value: getDomainObjectDetails(obj).label || '',
                description: getDomainObjectDetails(obj).id || '',
                click: () => {
                    inject(SidenavInfoService).toggle(DomainObjectCardComponent, { ref });
                },
            })),
            startWith({
                value: getDomainObjectDetails(sourceObj).label || '',
                description: getDomainObjectDetails(sourceObj).id || '',
                click: () => {
                    inject(SidenavInfoService).toggle(DomainObjectCardComponent, { ref });
                },
                inProgress: true,
            }),
        );
});
