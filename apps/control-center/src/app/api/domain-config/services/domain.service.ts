import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObject, Reference, ReflessDomainObject } from '@vality/domain-proto/domain';
import { Operation, Version } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, switchCombineWith } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { EMPTY, catchError, map, tap } from 'rxjs';

import { RepositoryClientService } from '../repository-client.service';
import { Repository2Service } from '../repository2.service';
import { AuthorStoreService } from '../stores/author-store.service';

import { DomainSecretService } from './domain-secret-service';

@Injectable({
    providedIn: 'root',
})
export class DomainService {
    version = rxResource({
        loader: () => this.repositoryService.GetLatestVersion(),
    });

    constructor(
        private repositoryService: Repository2Service,
        private authorStoreService: AuthorStoreService,
        private log: NotifyLogService,
        private repositoryClientService: RepositoryClientService,
        private domainSecretService: DomainSecretService,
    ) {}

    get(ref: Reference, version?: Version) {
        return this.repositoryClientService
            .CheckoutObject(version ? { version } : { head: {} }, ref)
            .pipe(
                switchCombineWith((obj) => [this.domainSecretService.reduceObject(obj.object)]),
                map(([{ info }, object]) => ({ info, object })),
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
            tap((res) => {
                this.version.set(res.version);
            }),
        );
    }

    update(objs: DomainObject[], version: Version, attempts = 1) {
        return this.commit(
            objs.map((obj) => ({ update: { object: obj } })),
            version,
        ).pipe(
            catchError((err) => {
                if (err?.name === 'ObsoleteCommitVersion') {
                    if (attempts !== 0) {
                        this.version.reload();
                        this.update(objs, version, attempts - 1);
                        this.log.error(err, `Domain config is out of date, one more attempt...`);
                        return EMPTY;
                    } else {
                        this.log.error(err, `Domain config is out of date, please try again`);
                    }
                }
                throw err;
            }),
            tap((res) => {
                this.version.set(res.version);
            }),
        );
    }

    remove(refs: Reference[]) {
        return this.commit(refs.map((ref) => ({ remove: { ref } }))).pipe(
            tap((res) => {
                this.version.set(res.version);
            }),
        );
    }

    private commit(ops: Operation[], version: Version = this.version.value()) {
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
}
