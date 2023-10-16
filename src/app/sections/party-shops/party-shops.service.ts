import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { progressTo } from '@vality/ng-core';
import { defer, merge, Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable()
export class PartyShopsService {
    shops$ = defer(() => this.party$).pipe(
        map((p) => p.shops),
        map((shops) => Array.from(shops.values())),
    );
    progress$ = new BehaviorSubject(0);

    private reload$ = new Subject<void>();

    private party$: Observable<Party> = merge(
        this.route.params,
        this.reload$.pipe(map(() => this.route.snapshot.params)),
    ).pipe(
        map((p) => p.partyID),
        switchMap((partyID) =>
            this.partyManagementService.Get(partyID).pipe(progressTo(this.progress$)),
        ),
        shareReplay(1),
    );

    constructor(
        private partyManagementService: PartyManagementService,
        private route: ActivatedRoute,
    ) {}

    reload() {
        this.reload$.next();
    }
}
