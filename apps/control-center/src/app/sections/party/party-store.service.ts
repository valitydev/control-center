import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotifyLogService } from '@vality/matez';
import { EMPTY, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs/operators';

import { PartiesStoreService } from '../../api/payment-processing';

@Injectable()
export class PartyStoreService {
    private route = inject(ActivatedRoute);
    private partiesStoreService = inject(PartiesStoreService);
    private log = inject(NotifyLogService);
    party$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        switchMap(({ partyID }) =>
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

    private get partyId() {
        return this.route.snapshot.params['partyID'] as string;
    }
}
