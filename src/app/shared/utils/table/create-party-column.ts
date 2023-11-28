import { inject } from '@angular/core';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import get from 'lodash-es/get';
import { switchMap, map } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export function createPartyColumn<T extends object>(
    field: ColumnObject<T>['field'],
    selectPartyId?: (d: T) => PossiblyAsync<string>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    const partiesStoreService = inject(PartiesStoreService);
    if (!selectPartyId) {
        selectPartyId = (d) => get(d, field);
    }
    return {
        field,
        header: 'Party',
        description: (d) => selectPartyId(d),
        formatter: (d) =>
            getPossiblyAsyncObservable(selectPartyId(d)).pipe(
                switchMap((partyId) => partiesStoreService.get(partyId)),
                map((p) => p.contact_info.email),
            ),
        ...params,
    } as ColumnObject<T>;
}
