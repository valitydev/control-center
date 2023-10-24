import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { progressTo } from '@vality/ng-core';
import { defer, merge, Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, startWith, debounceTime } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

@Injectable()
export class PartyShopsService {
    party$: Observable<Party> = merge(
        this.route.params,
        defer(() => this.reload$),
    ).pipe(
        startWith(null),
        debounceTime(300),
        map(() => this.route.snapshot.params.partyID),
        switchMap((partyID) =>
            this.partyManagementService.Get(partyID).pipe(progressTo(this.progress$)),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    shops$ = this.party$.pipe(
        map((p) => p.shops),
        map((shops) => Array.from(shops.values())),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    progress$ = new BehaviorSubject(0);

    private reload$ = new Subject<void>();

    constructor(
        private partyManagementService: PartyManagementService,
        private route: ActivatedRoute,
    ) {}

    reload() {
        this.reload$.next();
    }
}
