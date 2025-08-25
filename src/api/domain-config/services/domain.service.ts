import { Observable, catchError, combineLatest, iif, map, of, switchMap, tap } from 'rxjs';

import { Injectable, inject } from '@angular/core';

import { Reference } from '@vality/domain-proto/domain';
import {
    CommitResponse,
    Operation,
    RequestParams,
    Version,
    VersionedObject,
} from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, observableResource, switchCombineWith } from '@vality/matez';
import { getUnionKey, isEqualThrift } from '@vality/ng-thrift';

import { ThriftRepositoryClientService, ThriftRepositoryService } from '~/api/services';

import { AuthorStoreService } from '../stores/author-store.service';
import { getDomainObjectReference } from '../utils/get-domain-object-reference';

export class DomainServiceObsoleteCommitVersionError {
    constructor(
        public error: unknown,
        public newObject: VersionedObject,
    ) {}
}

@Injectable({
    providedIn: 'root',
})
export class DomainService {
    private repositoryService = inject(ThriftRepositoryService);
    private authorStoreService = inject(AuthorStoreService);
    private log = inject(NotifyLogService);
    private repositoryClientService = inject(ThriftRepositoryClientService);

    version = observableResource({
        loader: () => this.repositoryService.GetLatestVersion(),
    });

    get(ref: Reference, version?: Version): Observable<VersionedObject>;
    get(refs: Reference[], version?: Version): Observable<VersionedObject[]>;
    get(refs: Reference | Reference[], version?: Version) {
        return this.repositoryClientService
            .CheckoutObjects(
                version ? { version } : { head: {} },
                Array.isArray(refs) ? refs : [refs],
            )
            .pipe(map((objs) => (Array.isArray(refs) ? objs : objs[0])));
    }

    commit(ops: Operation[], version?: Version, attempts = 1): Observable<CommitResponse> {
        return combineLatest([
            iif(() => !!version, of(version), this.version.getFirstValue()),
            this.authorStoreService.author.getFirstValue(),
        ]).pipe(
            switchMap(([ver, author]) => this.repositoryService.Commit(ver, ops, author.id)),
            catchError((err) => {
                if (err?.error?.name === 'ObsoleteCommitVersion') {
                    if (
                        attempts !== 0 &&
                        // If no updates or only one update operation
                        (ops.every((o) => getUnionKey(o) !== 'update') || ops.length === 1)
                    ) {
                        this.log.error(err, `Domain config is out of date, one more attempt...`);
                        this.version.reload();
                        if (ops.every((o) => getUnionKey(o) !== 'update'))
                            return this.commit(ops, undefined, attempts - 1);
                        // If one update operation
                        return this.version.getFirstValue().pipe(
                            switchCombineWith(() => [
                                this.get(ops.map((o) => getDomainObjectReference(o.update.object))),
                            ]),
                            switchMap(([ver, obj]) => {
                                if (isEqualThrift(obj[0].object, ops[0].update.object))
                                    return this.commit(ops, ver, attempts - 1);
                                this.log.error(
                                    err,
                                    `Domain config is out of date, please try again`,
                                );
                                throw new DomainServiceObsoleteCommitVersionError(err, obj[0]);
                            }),
                        );
                    } else {
                        this.log.error(err, `Domain config is out of date, please try again`);
                    }
                } else {
                    const types = Array.from(new Set(ops.map((o) => getUnionKey(o))));
                    this.log.error(
                        err,
                        `Error ${types
                            .map((t) => {
                                switch (t) {
                                    case 'insert':
                                        return 'inserting';
                                    case 'update':
                                        return 'updating';
                                    case 'remove':
                                        return 'removing';
                                    default:
                                        return 'operating';
                                }
                            })
                            .join(
                                ', ',
                            )} ${ops.length > 1 ? `(${ops.length}) domain objects` : 'domain object'}`,
                    );
                }
                throw err;
            }),
            tap((res) => {
                this.version.set(res.version);
            }),
        );
    }

    getHistory(ref: Reference, params: RequestParams) {
        return this.repositoryService.GetObjectHistory(ref, params);
    }
}
