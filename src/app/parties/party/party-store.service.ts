import { EMPTY, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    map,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs/operators';

import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NotifyLogService } from '@vality/matez';

import { PartiesStoreService } from '~/api/payment-processing';

@Injectable()
export class PartyStoreService {
    private route = inject(ActivatedRoute);
    private partiesStoreService = inject(PartiesStoreService);
    private log = inject(NotifyLogService);

    id$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        map(({ partyID }) => partyID),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    party$ = this.id$.pipe(
        switchMap((partyID) =>
            partyID
                ? this.partiesStoreService.getParty(partyID).value$.pipe(
                      catchError((err) => {
                          this.log.error(err);
                          return EMPTY;
                      }),
                  )
                : of(null),
        ),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
}
