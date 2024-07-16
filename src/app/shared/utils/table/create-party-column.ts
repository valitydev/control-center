import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PossiblyAsync, ColumnObject, getPossiblyAsyncObservable } from '@vality/ng-core';
import get from 'lodash-es/get';
import { of } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export function createPartyColumn<T extends object>(
    field: ColumnObject<T>['field'],
    selectPartyId?: (d: T) => PossiblyAsync<string>,
    selectPartyEmail?: (d: T) => PossiblyAsync<string>,
    params: Partial<ColumnObject<T>> = {},
): ColumnObject<T> {
    const partiesStoreService = inject(PartiesStoreService);
    const router = inject(Router);
    if (!selectPartyId) {
        selectPartyId = (d) => get(d, field);
    }
    if (!selectPartyEmail) {
        selectPartyEmail = (d: T) =>
            getPossiblyAsyncObservable(selectPartyId(d)).pipe(
                switchMap((partyId) =>
                    partyId
                        ? partiesStoreService.get(partyId)
                        : of({ contact_info: { registration_email: '' } }),
                ),
                map((p) => p.contact_info.registration_email),
            );
    }
    return {
        field,
        header: 'Party',
        description: selectPartyId,
        formatter: selectPartyEmail,
        click: (d) => {
            getPossiblyAsyncObservable(selectPartyId(d))
                .pipe(
                    take(1),
                    map((id) => `/party/${id}`),
                )
                .subscribe((url) => {
                    void router.navigate([url]);
                });
        },
        ...params,
    } as ColumnObject<T>;
}
