import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Domain, DomainObject } from '@vality/domain-proto/domain';
import { Commit, Snapshot, Version } from '@vality/domain-proto/domain_config';
import { BehaviorSubject, defer, Observable, of, ReplaySubject } from 'rxjs';
import { map, pluck, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { RepositoryService } from '@cc/app/api/domain-config';
import { DomainSecretService } from '@cc/app/shared/services/domain-secret-service';
import { inProgressFrom, progressTo } from '@cc/utils';
import { getUnionKey } from '@cc/utils/get-union-key';

import { handleError, NotificationErrorService } from '../../shared/services/notification-error';

@UntilDestroy()
@Injectable({
    providedIn: 'root',
})
export class DomainStoreService {
    version$ = defer(() => this.snapshot$).pipe(pluck('version'));
    isLoading$ = inProgressFrom(
        () => this.progress$,
        defer(() => this.snapshot$),
    );

    private snapshot$: Observable<Snapshot> = defer(() => this.reload$).pipe(
        startWith(undefined),
        switchMap(() =>
            this.repositoryService
                .Checkout({ head: {} })
                .pipe(progressTo(this.progress$), handleError(this.notificationErrorService.error)),
        ),
        untilDestroyed(this),
        shareReplay(1),
    );
    private reload$ = new ReplaySubject<void>(1);
    private progress$ = new BehaviorSubject(0);

    constructor(
        private repositoryService: RepositoryService,
        private domainSecretService: DomainSecretService,
        private notificationErrorService: NotificationErrorService,
    ) {}

    forceReload(): void {
        this.reload$.next();
    }

    getDomain(raw = false): Observable<Domain> {
        return this.snapshot$.pipe(
            pluck('domain'),
            map((d) => (raw ? d : this.domainSecretService.reduceDomain(d))),
        );
    }

    getObjects<T extends keyof DomainObject>(objectType: T): Observable<DomainObject[T][]> {
        return this.getDomain().pipe(
            map((d) =>
                Array.from(d.values())
                    .filter((o) => getUnionKey(o) === objectType)
                    .map((o) => o[objectType]),
            ),
        );
    }

    commit(commit: Commit, version?: Version | number, reload = true) {
        const version$ = version ? of(version) : this.version$.pipe(take(1));
        return version$.pipe(
            switchMap((v) => this.repositoryService.Commit(v, commit)),
            tap(() => {
                if (reload) this.forceReload();
            }),
        );
    }
}
