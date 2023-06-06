import { Injectable } from '@angular/core';
import { PartyID } from '@vality/domain-proto/domain';
import { shareReplay } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable({
    providedIn: 'root',
})
export class PartiesStoreService {
    constructor(private partyManagementService: PartyManagementService) {}

    @MemoizeExpiring(5 * 60_000)
    get(partyId: PartyID) {
        return this.partyManagementService
            .Get(partyId)
            .pipe(shareReplay({ refCount: true, bufferSize: 1 }));
    }
}
