import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObject, Reference, ReflessDomainObject } from '@vality/domain-proto/domain';
import { Operation, Version, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, switchCombineWith } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { EMPTY, Observable, catchError, map, share, tap } from 'rxjs';

import { RepositoryClientService } from '../repository-client.service';
import { Repository2Service } from '../repository2.service';
import { DomainSecretService } from '../services';
import { createObjectHash } from '../utils/create-object-hash';

import { AuthorStoreService } from './author-store.service';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version = rxResource({
        loader: () =>
            this.repositoryService.GetLatestVersion().pipe(
                tap((version) => this.setObjectsVersion(version)),
                share(),
            ),
    });

    private objectsVersion: number = null;
    private objects = new Map<string, VersionedObject>();

    constructor(
        private repositoryService: Repository2Service,
        private repositoryClientService: RepositoryClientService,
        private authorStoreService: AuthorStoreService,
        private log: NotifyLogService,
        private domainSecretService: DomainSecretService,
    ) {}

    getObject(ref: Reference): Observable<VersionedObject> {
        return this.getSecretObject(ref).pipe(
            switchCombineWith((obj) => [this.domainSecretService.reduceObject(obj.object)]),
            map(([{ info }, object]) => ({ info, object })),
        );
    }

    commit(ops: Operation[], version: Version = this.version.value()) {
        return this.repositoryService
            .Commit(version, ops, this.authorStoreService.author.value().id)
            .pipe(
                catchError((err) => {
                    const types = ops.map((o) => getUnionKey(o));
                    const operationType = types.every((t) => t === types[0]) ? types[0] : 'update';
                    this.log.errorOperation(
                        err,
                        operationType === 'update'
                            ? 'update'
                            : operationType === 'insert'
                              ? 'create'
                              : 'delete',
                        types.length > 1 ? 'domain objects' : 'domain object',
                    );
                    throw err;
                }),
                tap((res) => {
                    this.version.set(res.version);
                }),
            );
    }

    insert(objs: ReflessDomainObject[], attempts = 1) {
        return this.commit(objs.map((obj) => ({ insert: { object: obj } }))).pipe(
            catchError((err) => {
                if (err?.name === 'ObsoleteCommitVersion') {
                    if (attempts !== 0) {
                        this.version.reload();
                        this.insert(objs, attempts - 1);
                        this.log.error(err, `Domain config is out of date, one more attempt...`);
                        return EMPTY;
                    } else {
                        this.log.error(err, `Domain config is out of date, please try again`);
                    }
                }
                throw err;
            }),
        );
    }

    update(objs: DomainObject[], attempts = 1) {
        return this.commit(objs.map((obj) => ({ update: { object: obj } }))).pipe(
            catchError((err) => {
                if (err?.name === 'ObsoleteCommitVersion') {
                    if (attempts !== 0) {
                        this.version.reload();
                        this.update(objs, attempts - 1);
                        this.log.error(err, `Domain config is out of date, one more attempt...`);
                        return EMPTY;
                    } else {
                        this.log.error(err, `Domain config is out of date, please try again`);
                    }
                }
                throw err;
            }),
        );
    }

    remove(refs: Reference[]) {
        return this.commit(refs.map((ref) => ({ remove: { ref } })));
    }

    private getSecretObject(ref: Reference, version = this.version.value()) {
        return this.repositoryClientService.CheckoutObject({ version }, ref).pipe(
            tap((obj) => {
                this.setObject(obj, version);
            }),
            share(),
        );
    }

    private setObjectsVersion(newVersion: number) {
        if (this.objectsVersion !== newVersion) {
            this.objectsVersion = newVersion;
            this.objects.clear();
        }
    }

    private setObject(obj: VersionedObject, version: number) {
        if (version === this.objectsVersion) {
            this.objects.set(
                createObjectHash({ [getUnionKey(obj.object)]: getUnionValue(obj.object).ref }),
                obj,
            );
        }
    }
}
