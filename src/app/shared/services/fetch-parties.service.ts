import { Injectable } from '@angular/core';
import { Party } from '@vality/deanonimus-proto/deanonimus';
import { NotifyLogService, handleError } from '@vality/ng-core';
import { Observable, of, Subject, defer, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap, debounceTime } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';
import { progressTo, inProgressFrom } from '@cc/utils';

@Injectable()
export class FetchPartiesService {
    parties$: Observable<Party[]> = defer(() => this.searchParties$).pipe(
        debounceTime(200),
        switchMap((text) =>
            text
                ? this.deanonimusService.searchParty(text).pipe(
                      map((hits) => hits.map((hit) => hit.party)),
                      handleError(this.log.error, []),
                      progressTo(this.progress$),
                  )
                : of([]),
        ),
        shareReplay(1),
    );
    inProgress$ = inProgressFrom(
        () => this.progress$,
        () => this.parties$,
    );

    private progress$ = new BehaviorSubject(0);
    private searchParties$: Subject<string> = new Subject();

    constructor(
        private deanonimusService: DeanonimusService,
        private log: NotifyLogService,
    ) {}

    searchParties(text: string) {
        this.searchParties$.next(text);
    }
}
