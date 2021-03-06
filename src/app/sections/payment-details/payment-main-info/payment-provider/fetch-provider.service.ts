import { Injectable } from '@angular/core';
import { merge, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { DomainStoreService } from '../../../../thrift-services/damsel/domain-store.service';

@Injectable()
export class FetchProviderService {
    private getProvider$ = new Subject<number>();
    private hasError$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    provider$ = this.getProvider$.pipe(
        switchMap((providerID) =>
            this.domainStoreService.getObjects('provider').pipe(
                map((providerObject) => providerObject.find((obj) => obj.ref.id === providerID)),
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
    inProgress$ = progress(this.getProvider$, merge(this.provider$, this.hasError$)).pipe(
        startWith(true)
    );

    constructor(private domainStoreService: DomainStoreService) {
        this.provider$.subscribe();
    }

    getProvider(providerID: number) {
        this.getProvider$.next(providerID);
    }
}
