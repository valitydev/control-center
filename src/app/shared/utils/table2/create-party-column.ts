import { inject } from '@angular/core';
import { createColumn } from '@vality/ng-core';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export const createPartyColumn = createColumn(
    ({ id, ...params }: { id: string; partyName?: string }) => {
        const partyName$ =
            'partyName' in params
                ? of(params.partyName)
                : inject(PartiesStoreService)
                      .get(id)
                      .pipe(map((party) => party.contact_info.registration_email));
        const partyCell = {
            description: id,
            link: () => `/party/${id}`,
        };
        return partyName$.pipe(
            map((partyName) => ({
                ...partyCell,
                value: partyName,
            })),
            startWith({
                ...partyCell,
                inProgress: true,
            }),
        );
    },
    { header: 'Party' },
);
