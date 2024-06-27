import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { createColumn } from '@vality/ng-core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

import { PartiesStoreService } from '../../../api/payment-processing';

export const createPartyColumn = createColumn(
    ({ id, ...params }: { id: string; partyName?: string }) => {
        const partyName$ =
            'partyName' in params
                ? of(params.partyName)
                : inject(PartiesStoreService)
                      .get(id)
                      .pipe(map((party) => party.contact_info.email));
        return partyName$.pipe(
            map((partyName) => ({
                value: partyName,
                description: id,
                click: () => {
                    void inject(Router).navigate([`/party/${id}`]);
                },
            })),
        );
    },
    'Party',
);
