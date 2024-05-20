import { inject } from '@angular/core';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import get from 'lodash-es/get';
import { combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';
import { ShopCardComponent } from '../../components/shop-card/shop-card.component';
import { SidenavInfoService } from '../../components/sidenav-info';

export function createShopColumn<T extends object>(
    field: ColumnObject<T>['field'],
    selectPartyId: (d: T) => PossiblyAsync<string>,
    selectShopId?: (d: T) => PossiblyAsync<string>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    if (!selectShopId) {
        selectShopId = (d) => get(d, field);
    }
    const partiesStoreService = inject(PartiesStoreService);
    const sidenavInfoService = inject(SidenavInfoService);
    return {
        field,
        header: 'Shop',
        description: (d) => selectShopId(d),
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
        click: (d) => {
            combineLatest([
                getPossiblyAsyncObservable(selectPartyId(d)),
                getPossiblyAsyncObservable(selectShopId(d)),
            ])
                .pipe(take(1))
                .subscribe(([partyId, id]) => {
                    sidenavInfoService.toggle(ShopCardComponent, { id, partyId });
                });
        },
        ...params,
    } as ColumnObject<T>;
}
