import { inject } from '@angular/core';
import { createColumn } from '@vality/matez';
import { of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DomainObjectsStoreService } from '../../../api/domain-config';

export const createPartyColumn = createColumn(
    ({ id, ...params }: { id: string; partyName?: string }) => {
        const partyName$ =
            'partyName' in params
                ? of(params.partyName)
                : inject(DomainObjectsStoreService)
                      .getLimitedObject({ party_config: { id } })
                      .value$.pipe(map((party) => party.name));
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
