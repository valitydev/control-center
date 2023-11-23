import { Injectable } from '@angular/core';
import { PartyID } from '@vality/domain-proto/domain';
import { progressTo } from '@vality/ng-core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    progress$ = new BehaviorSubject(0);

    constructor(private partyManagementService: PartyManagementService) {}

    @MemoizeExpiring(5 * 60_000)
    get(partyId: PartyID) {
        return this.partyManagementService
            .Get(partyId)
            .pipe(progressTo(this.progress$), shareReplay({ refCount: true, bufferSize: 1 }));
    }
}
