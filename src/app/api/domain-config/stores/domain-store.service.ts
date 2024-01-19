import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Domain, DomainObject, Reference } from '@vality/domain-proto/domain';
import { Commit, Snapshot, Version } from '@vality/domain-proto/domain_config';
import { NotifyLogService } from '@vality/ng-core';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject, defer, Observable, of, ReplaySubject, filter, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { inProgressFrom, progressTo, getUnionKey } from '../../../../utils';
import { DomainSecretService } from '../../../shared/services';
import { handleError } from '../../../shared/services/notification-error';
import { RepositoryService } from '../repository.service';

@Injectable({
    providedIn: 'root',
})
export class DomainStoreService {
    version$ = combineLatest([defer(() => this.snapshot$), defer(() => this.progress$)]).pipe(
        filter(([, p]) => !p),
        map(([s]) => s.version),
        take(1),
    );
    isLoading$ = inProgressFrom(
        () => this.progress$,
        defer(() => this.snapshot$),
    );

    private snapshot$: Observable<Snapshot> = defer(() => this.reload$).pipe(
        startWith(undefined),
        switchMap(() =>
            this.repositoryService
                .Checkout({ head: {} })
                .pipe(progressTo(this.progress$), handleError(this.log.error)),
        ),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );
    private reload$ = new ReplaySubject<void>(1);
    private progress$ = new BehaviorSubject(0);

    constructor(
        private repositoryService: RepositoryService,
        private domainSecretService: DomainSecretService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {}

    forceReload(): void {
        this.reload$.next();
    }

    getDomain(raw = false): Observable<Domain> {
        return this.snapshot$.pipe(
            map((s) => s?.domain),
            map((d) => (raw ? d : this.domainSecretService.reduceDomain(d))),
        );
    }

    getObject(ref: Reference): Observable<DomainObject> {
        return this.getDomain().pipe(
            map((domain) => Array.from(domain).find(([r]) => isEqual(ref, r))[1]),
        );
    }

    getObjects<T extends keyof DomainObject>(objectType: T): Observable<DomainObject[T][]> {
        return this.getObjectsRefs(objectType).pipe(map((d) => d.map(([, o]) => o[objectType])));
    }

    getObjectsRefs<T extends keyof DomainObject>(
        objectType: T,
    ): Observable<[Reference, DomainObject][]> {
        return this.getDomain().pipe(
            map((d) => Array.from(d).filter(([, o]) => getUnionKey(o) === objectType)),
        );
    }

    commit(commit: Commit, version?: Version | number, reload = true) {
        const version$ = version ? of(version) : this.version$.pipe(take(1));
        return version$.pipe(
            switchMap((v) => this.repositoryService.Commit(v, commit)),
            tap(() => {
                if (reload) {
                    this.forceReload();
                }
            }),
        );
    }
}
