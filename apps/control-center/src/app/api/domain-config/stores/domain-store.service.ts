import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import { Commit, Snapshot, Version } from '@vality/domain-proto/domain_config';
import { NotifyLogService, handleError, inProgressFrom, progressTo } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, defer, filter, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { RepositoryService } from '../repository.service';
import { DomainSecretService } from '../services';
import { createObjectHash } from '../utils/create-object-hash';

/**
 * @deprecated use DomainObjectsStoreService instead
 */
@Injectable({
    providedIn: 'root',
})
export class DomainStoreService {
    private repositoryService = inject(RepositoryService);
    private domainSecretService = inject(DomainSecretService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    /**
     * @deprecated
     */
    domain$ = defer(() => this.rawDomain$).pipe(
        map((d) => this.domainSecretService.reduceDomain(d)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    /**
     * @deprecated
     */
    version$ = defer(() => this.loadedSnapshot$).pipe(
        map(([s]) => s.version),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    /**
     * @deprecated
     */
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
    private loadedSnapshot$ = combineLatest([
        defer(() => this.snapshot$),
        defer(() => this.progress$),
    ]).pipe(
        filter(([, p]) => !p),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    private reload$ = new ReplaySubject<void>(1);
    private progress$ = new BehaviorSubject(0);
    private rawDomain$ = this.loadedSnapshot$.pipe(
        map(([s]) => s?.domain),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    private objects$ = combineLatest([this.rawDomain$, this.domain$]).pipe(
        map(
            ([rawDomain, domain]) =>
                new Map(
                    Array.from(rawDomain).map(([ref, raw]) => [
                        createObjectHash(ref),
                        { raw, reduced: domain.get(ref) },
                    ]),
                ),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    /**
     * @deprecated
     */
    forceReload(): void {
        this.reload$.next();
    }

    /**
     * @deprecated
     */
    getObject(ref: Reference, raw = false): Observable<DomainObject> {
        return this.objects$.pipe(
            map((objects) => objects.get(createObjectHash(ref))?.[raw ? 'raw' : 'reduced']),
        );
    }

    /**
     * @deprecated
     */
    getObjects<T extends keyof DomainObject>(objectType: T): Observable<DomainObject[T][]> {
        return this.getObjectsRefs(objectType).pipe(map((d) => d.map(([, o]) => o[objectType])));
    }

    /**
     * @deprecated
     */
    getObjectsRefs<T extends keyof DomainObject>(
        objectType: T,
    ): Observable<[Reference, DomainObject][]> {
        return this.domain$.pipe(
            map((d) => Array.from(d).filter(([, o]) => getUnionKey(o) === objectType)),
        );
    }

    /**
     * @deprecated
     */
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
