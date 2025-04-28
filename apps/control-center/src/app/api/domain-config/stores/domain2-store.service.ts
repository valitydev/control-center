import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Operation, Version } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { catchError, of } from 'rxjs';

import { Repository2Service } from '../repository2.service';

import { AuthorStoreService } from './author-store.service';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version = rxResource({ loader: () => this.repositoryService.GetLatestVersion() });

    constructor(
        private repositoryService: Repository2Service,
        private authorStoreService: AuthorStoreService,
        private log: NotifyLogService,
    ) {}

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
                    return of(null);
                }),
            );
    }
}
