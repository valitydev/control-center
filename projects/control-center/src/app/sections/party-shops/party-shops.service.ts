import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/lib/domain';
import { defer, Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable()
export class PartyShopsService {
    shops$ = defer(() => this.party$).pipe(
        pluck('shops'),
        map((shops) => Array.from(shops.values()))
    );

    private party$: Observable<Party> = this.route.params.pipe(
        pluck('partyID'),
        switchMap((partyID) => this.partyManagementService.Get(partyID)),
        shareReplay(1)
    );

    constructor(
        private partyManagementService: PartyManagementService,
        private route: ActivatedRoute
    ) {}
}
