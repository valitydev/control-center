import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import { Commit, Snapshot, Version } from '@vality/domain-proto/domain_config';
import { NotifyLogService, handleError, inProgressFrom, progressTo } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { BehaviorSubject, defer, Observable, of, ReplaySubject, filter, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { DomainSecretService } from '../../../shared/services';
import { RepositoryService } from '../repository.service';
import { createObjectHash } from '../utils/create-object-hash';

@Injectable({
    providedIn: 'root',
})
export class DomainStoreService {
    domain$ = defer(() => this.rawDomain$).pipe(
        map((d) => this.domainSecretService.reduceDomain(d)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    version$ = defer(() => this.loadedSnapshot$).pipe(
        map(([s]) => s.version),
        shareReplay({ refCount: true, bufferSize: 1 }),
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
    private objects$ = this.rawDomain$.pipe(
        map((domain) => new Map(Array.from(domain).map(([r, d]) => [createObjectHash(r), d]))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private repositoryService: RepositoryService,
        private domainSecretService: DomainSecretService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {}

    forceReload(): void {
        this.reload$.next();
    }

    getObject(ref: Reference, raw = false): Observable<DomainObject> {
        return this.objects$.pipe(
            map((objects) => {
                const res = objects.get(createObjectHash(ref));
                return raw || !this.domainSecretService.isExcludedObject(res) ? res : undefined;
            }),
        );
    }

    getObjects<T extends keyof DomainObject>(objectType: T): Observable<DomainObject[T][]> {
        return this.getObjectsRefs(objectType).pipe(map((d) => d.map(([, o]) => o[objectType])));
    }

    getObjectsRefs<T extends keyof DomainObject>(
        objectType: T,
    ): Observable<[Reference, DomainObject][]> {
        return this.domain$.pipe(
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
