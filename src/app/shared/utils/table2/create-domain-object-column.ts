import { inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/internal/domain';
import { createColumn } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../components/sidenav-info';
import {
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '../../components/thrift-api-crud';

export const createDomainObjectColumn = createColumn(
    ({ ref }: { ref: Reference }) => {
        return inject(DomainStoreService)
            .getObject(ref)
            .pipe(
                map((obj) => ({
                    value: getDomainObjectDetails(obj).label,
                    description: getDomainObjectDetails(obj).id,
                    click: () => {
                        inject(SidenavInfoService).toggle(DomainObjectCardComponent, { ref });
                    },
                })),
            );
    },
    { header: 'Object' },
);
