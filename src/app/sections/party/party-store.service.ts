import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { NotifyLogService } from '@vality/ng-core';
import { EMPTY, Observable, of } from 'rxjs';
import {
    startWith,
    switchMap,
    catchError,
    shareReplay,
    distinctUntilChanged,
} from 'rxjs/operators';

import { PartyManagementService } from '../../api/payment-processing';

@Injectable()
export class PartyStoreService {
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
        return this.route.snapshot.params.partyID;
    }

    constructor(
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private log: NotifyLogService,
    ) {}
}
