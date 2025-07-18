import { Injectable, inject } from '@angular/core';
import { DomainObjectType, RoutingRulesetRef } from '@vality/domain-proto/domain';
import { Operation, Repository, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, fetchAll, observableResource } from '@vality/matez';
import { catchError, first, map, of, shareReplay, switchMap } from 'rxjs';

import { DomainService } from '../services';

@Injectable({ providedIn: 'root' })
export class RoutingRulesStoreService {
    private repositoryService = inject(Repository);
    private domainService = inject(DomainService);
    private log = inject(NotifyLogService);

    resource = observableResource({
        loader: () =>
            fetchAll((continuationToken) =>
                this.repositoryService.SearchFullObjects({
                    type: DomainObjectType.routing_rules,
                    query: '*',
                    limit: 1_000_000,
                    continuation_token: continuationToken,
                }),
            ).pipe(
                catchError((err) => {
                    this.log.errorOperation(err, 'receive', 'routing rules');
                    return of<VersionedObject[]>([]);
                }),
            ),
    });

    routingRules$ = this.resource.value$.pipe(
        map((objs) => objs.map((obj) => obj.object.routing_rules)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    version$ = this.resource.value$.pipe(
        map((objs) => Math.max(...objs.map((obj) => obj.info.version))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    isLoading$ = this.resource.isLoading$;

    reload() {
        this.resource.reload();
    }

    get(ref: RoutingRulesetRef) {
        return this.routingRules$.pipe(
            map((objs) => objs.find((o) => o.ref.id === ref.id)),
            shareReplay({ refCount: true, bufferSize: 1 }),
        );
    }

    commit(ops: Operation[]) {
        return this.version$.pipe(
            first(),
            switchMap((ver) => this.domainService.commit(ops, ver)),
        );
    }
}
