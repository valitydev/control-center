import { Injectable } from '@angular/core';
import { merge, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';

@Injectable()
export class FetchTerminalService {
    private getTerminal$ = new Subject<number>();
    private hasError$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    terminal$ = this.getTerminal$.pipe(
        switchMap((terminalID) =>
            this.domainStoreService.getObjects('terminal').pipe(
                map((terminalObject) => terminalObject.find((obj) => obj.ref.id === terminalID)),
                catchError(() => {
                    this.hasError$.next();
                    return of('error');
                }),
                filter((result) => result !== 'error')
            )
        ),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.getTerminal$, merge(this.terminal$, this.hasError$)).pipe(
        startWith(true)
    );

    constructor(private domainStoreService: DomainStoreService) {
        this.terminal$.subscribe();
    }

    getTerminal(terminalID: number) {
        this.getTerminal$.next(terminalID);
    }
}
