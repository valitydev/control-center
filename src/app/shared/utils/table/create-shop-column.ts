import { inject } from '@angular/core';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import get from 'lodash-es/get';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export function createShopColumn<T extends object>(
    field: ColumnObject<T>['field'],
    selectPartyId: (d: T) => PossiblyAsync<string>,
    selectShopId?: (d: T) => PossiblyAsync<string>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    const partiesStoreService = inject(PartiesStoreService);
    if (!selectShopId) {
        selectShopId = (d) => get(d, field);
    }
    return {
        field,
        header: 'Shop',
        description: (d) => selectPartyId(d),
        formatter: (d) =>
            getPossiblyAsyncObservable(selectPartyId(d)).pipe(
                switchMap((partyId) =>
                    combineLatest([
                        partiesStoreService.get(partyId),
                        getPossiblyAsyncObservable(selectShopId(d)),
                    ]),
                ),
                map(([party, shopId]) => party.shops.get(shopId).details.name),
            ),
        ...params,
    } as ColumnObject<T>;
}
