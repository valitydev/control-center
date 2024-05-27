import { inject } from '@angular/core';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import get from 'lodash-es/get';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export function createWalletColumn<T extends object>(
    field: ColumnObject<T>['field'],
    selectPartyId: (d: T) => PossiblyAsync<string>,
    selectWalletId?: (d: T) => PossiblyAsync<string>,
    selectWalletName?: (d: T) => PossiblyAsync<string>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    if (!selectWalletId) {
        selectWalletId = (d) => get(d, field);
    }
    if (!selectWalletName) {
        const partiesStoreService = inject(PartiesStoreService);
        selectWalletName = (d) =>
            getPossiblyAsyncObservable(selectPartyId(d)).pipe(
                switchMap((partyId) =>
                    combineLatest([
                        partiesStoreService.get(partyId),
                        getPossiblyAsyncObservable(selectWalletId(d)),
                    ]),
                ),
                map(([party, walletId]) => party.wallets.get(walletId)?.name),
            );
    }
    return {
        field,
        header: 'Wallet',
        description: (d) => getPossiblyAsyncObservable(selectWalletId(d)),
        formatter: (d) => getPossiblyAsyncObservable(selectWalletName(d)),
        ...params,
    } as ColumnObject<T>;
}
