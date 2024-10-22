import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PartiesStoreService } from '@cc/app/api/payment-processing';

export const createWalletColumn = createColumn(
    ({ id, partyId, ...params }: { id: string; partyId: string; name?: string }) => {
        const name$ =
            'name' in params
                ? of(params.name)
                : inject(PartiesStoreService)
                      .getWallet(id, partyId)
                      .pipe(map((wallet) => wallet?.name));
        const cell = { description: id };
        return name$.pipe(
            map((name) => ({
                ...cell,
                value: name,
            })),
            startWith({
                ...cell,
                inProgress: true,
            }),
        );
    },
    { header: 'Wallet' },
);
