import { Injectable } from '@angular/core';
import { Party } from '@vality/deanonimus-proto';
import { Observable, of, Subject, defer, BehaviorSubject } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { DeanonimusService } from '@cc/app/api/deanonimus';
import { progressTo, inProgressFrom } from '@cc/utils';

@Injectable()
export class FetchPartiesService {
    parties$: Observable<Party[]> = defer(() => this.searchParties$).pipe(
        switchMap((text) =>
            this.deanonimusService.searchParty(text).pipe(
                map((hits) => hits.map((hit) => hit.party)),
                catchError((err) => {
                    console.error(err);
                    return of<Party[]>([]);
                }),
                progressTo(this.progress$)
            )
        ),
        shareReplay(1)
    );
    inProgress$ = inProgressFrom(
        () => this.progress$,
        () => this.parties$
    );

    private progress$ = new BehaviorSubject(0);
    private searchParties$: Subject<string> = new Subject();

    constructor(private deanonimusService: DeanonimusService) {}

    searchParties(text: string) {
        this.searchParties$.next(text);
    }
}
