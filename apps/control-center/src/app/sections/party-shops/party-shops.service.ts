import { Injectable, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { progressTo, debounceTimeWithFirst } from '@vality/matez';
import { defer, merge, Observable, Subject, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, startWith } from 'rxjs/operators';

import { PartyManagementService } from '@cc/app/api/payment-processing';

import { DEBOUNCE_TIME_MS } from '../../tokens';

@Injectable()
export class PartyShopsService {
    party$: Observable<Party> = merge(
        this.route.params,
        defer(() => this.reload$),
    ).pipe(
        startWith(null),
        debounceTimeWithFirst(this.debounceTimeMs),
        map(() => this.route.snapshot.params['partyID']),
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
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
    ) {}

    reload() {
        this.reload$.next();
    }
}
