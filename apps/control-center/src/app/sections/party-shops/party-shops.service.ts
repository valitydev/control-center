import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Party } from '@vality/domain-proto/domain';
import { debounceTimeWithFirst, progressTo } from '@vality/matez';
import { BehaviorSubject, Observable, Subject, defer, merge } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { PartyManagementService } from '../../api/payment-processing/party-management.service';
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
