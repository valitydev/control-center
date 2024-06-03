import { inject } from '@angular/core';
import { Reference } from '@vality/domain-proto/domain';
import { PossiblyAsync, getPossiblyAsyncObservable, type ColumnObject } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { map, switchMap, first } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { DomainStoreService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../components/sidenav-info';
import {
    getDomainObjectDetails,
    DomainObjectCardComponent,
} from '../../components/thrift-api-crud';

export function createDomainObjectColumn<T extends object>(
    objectKey: keyof Reference,
    selectDomainObjectRef: (d: T) => PossiblyAsync<ValuesType<Reference>>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    const domainStoreService = inject(DomainStoreService);
    const sidenavInfoService = inject(SidenavInfoService);
    const getObjectRef = (d: T) =>
        getPossiblyAsyncObservable(selectDomainObjectRef(d)).pipe(
            map((ref): Reference => ({ [objectKey]: ref })),
        );
    const getObject = (d: T) =>
        getObjectRef(d).pipe(switchMap((ref) => domainStoreService.getObject(ref)));
    return {
        field: `domain_object_${objectKey}`,
        header: startCase(objectKey),
        description: (d) => getObject(d).pipe(map((o) => getDomainObjectDetails(o)?.id)),
        formatter: (d) => getObject(d).pipe(map((o) => getDomainObjectDetails(o)?.label)),
        click: (d) => {
            getObjectRef(d)
                .pipe(first())
                .subscribe((ref) => {
                    sidenavInfoService.toggle(DomainObjectCardComponent, { ref });
                });
        },
        ...params,
    } as ColumnObject<T>;
}
