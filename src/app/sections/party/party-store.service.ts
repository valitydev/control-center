import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotifyLogService } from '@vality/ng-core';
import { EMPTY } from 'rxjs';
import { startWith, switchMap, catchError, shareReplay } from 'rxjs/operators';

import { PartyManagementService } from '../../api/payment-processing';

@Injectable()
export class PartyStoreService {
    party$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        switchMap(({ partyID }) =>
            this.partyManagementService.Get(partyID).pipe(
                catchError((err) => {
                    this.log.error(err);
                    return EMPTY;
                }),
            ),
        ),
        startWith(this.partyId ? { id: this.partyId } : null),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    get partyId() {
        return this.route.snapshot.params.partyID;
    }

    constructor(
        private route: ActivatedRoute,
        private partyManagementService: PartyManagementService,
        private log: NotifyLogService,
    ) {}
}
