import { Injectable } from '@angular/core';
import { Party } from '@vality/deanonimus-proto/deanonimus';
import { Observable, of, Subject, defer, BehaviorSubject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';
import { progressTo, inProgressFrom } from '@cc/utils';

import { handleError, NotificationErrorService } from './notification-error';

@Injectable()
export class FetchPartiesService {
    parties$: Observable<Party[]> = defer(() => this.searchParties$).pipe(
        switchMap((text) =>
            this.deanonimusService.searchParty(text).pipe(
                map((hits) => hits.map((hit) => hit.party)),
                handleError(this.notificationErrorService.error, null, of<Party[]>([])),
                progressTo(this.progress$),
            ),
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
        private notificationErrorService: NotificationErrorService,
    ) {}

    searchParties(text: string) {
        this.searchParties$.next(text);
    }
}
