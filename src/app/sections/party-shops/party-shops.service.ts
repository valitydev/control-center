import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/lib/domain';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { PartyService } from '../../papi/party.service';

@Injectable()
export class PartyShopsService {
    private party$: Observable<Party> = this.route.params.pipe(
        pluck('partyID'),
        switchMap((partyID) => this.partyService.getParty(partyID)),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    shops$ = this.party$.pipe(
        pluck('shops'),
        map((shops) => Array.from(shops.values()))
    );

    constructor(private partyService: PartyService, private route: ActivatedRoute) {}
}
