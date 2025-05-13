import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DomainObject, Reference, ReflessDomainObject } from '@vality/domain-proto/domain';
import { Operation, Version } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { EMPTY, catchError, map, tap } from 'rxjs';

import { Repository2Service } from '../repository2.service';

import { AuthorStoreService } from './author-store.service';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version = rxResource({
        loader: () => this.repositoryService.GetLatestVersion(),
    });

    constructor(
        private repositoryService: Repository2Service,
        private authorStoreService: AuthorStoreService,
        private log: NotifyLogService,
    ) {}

    getObject(ref: Reference) {
        // TODO: replace with RepositoryClient/CheckoutObject
        return this.repositoryService
            .GetObjectHistory(ref, { limit: 1 })
            .pipe(map((res) => res.result[0]));
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
}
