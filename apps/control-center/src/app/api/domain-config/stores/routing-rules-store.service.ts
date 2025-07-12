import { Injectable, inject } from '@angular/core';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { Repository, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, fetchAll, observableResource } from '@vality/matez';
import { catchError, map, of, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoutingRulesStoreService {
    private repositoryService = inject(Repository);
    private log = inject(NotifyLogService);

    resource = observableResource({
        initParams: null,
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
        map((objs) => objs.map((obj) => obj.object.routing_rules.data)),
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
}
