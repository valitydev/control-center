import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { NotifyLogService } from '@vality/matez';
import { EMPTY, Observable, of } from 'rxjs';
import {
    catchError,
    distinctUntilChanged,
    shareReplay,
    startWith,
    switchMap,
} from 'rxjs/operators';

import { PartyManagementService } from '../../api/payment-processing';

@Injectable()
export class PartyStoreService {
    private route = inject(ActivatedRoute);
    private partyManagementService = inject(PartyManagementService);
    private log = inject(NotifyLogService);
    party$: Observable<Party | Partial<Party> | null> = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        switchMap(({ partyID }) =>
            partyID
                ? this.partyManagementService.Get(partyID).pipe(
                      catchError((err) => {
                          this.log.error(err);
                          return EMPTY;
                      }),
                  )
                : of(null),
        ),
        startWith(this.partyId ? { id: this.partyId } : null),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private get partyId() {
        return this.route.snapshot.params['partyID'];
    }
}
