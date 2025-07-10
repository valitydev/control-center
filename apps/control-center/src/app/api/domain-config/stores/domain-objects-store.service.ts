import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { DomainObjectType, Reference } from '@vality/domain-proto/domain';
import { RepositoryClient } from '@vality/domain-proto/domain_config';
import {
    LimitedVersionedObject,
    Repository,
    VersionedObject,
} from '@vality/domain-proto/domain_config_v2';
import { ObservableResource, mapObservableResource, observableResource } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { Observable, map, of, retry, switchMap } from 'rxjs';

import { createObjectHash } from '../utils/create-object-hash';

@Injectable({ providedIn: 'root' })
export class DomainObjectsStoreService {
    private repositoryService = inject(Repository);
    private repositoryClientService = inject(RepositoryClient);
    private injector = inject(Injector);

    private limitedObjects = new Map<
        keyof Reference,
        ObservableResource<Map<string, LimitedVersionedObject>>
    >();
    private objects = new Map<keyof Reference, ObservableResource<Map<string, VersionedObject>>>();

    getLimitedObject(ref: Reference) {
        const type = getUnionKey(ref);
        return runInInjectionContext(this.injector, () =>
            mapObservableResource(this.getLimitedObjectsByType(type), (objects) =>
                objects.get(createObjectHash(ref)),
            ),
        );
    }

    getLimitedObjects(type: keyof Reference) {
        return runInInjectionContext(this.injector, () =>
            mapObservableResource(this.getLimitedObjectsByType(type), (objects) =>
                Array.from(objects.values()),
            ),
        );
    }

    getObject(ref: Reference) {
        return this.repositoryClientService.checkoutObject({ head: {} }, ref);
    }

    private getLimitedObjectsByType(type: keyof Reference) {
        if (!this.limitedObjects.has(type))
            this.limitedObjects.set(
                type,
                runInInjectionContext(this.injector, () =>
                    observableResource({
                        initParams: null,
                        loader: (_, objects) =>
                            this.loadLimitedObjects(type).pipe(
                                map((result) => {
                                    objects.clear();
                                    result.forEach((obj) => {
                                        objects.set(createObjectHash(obj.ref), obj);
                                    });
                                    return objects;
                                }),
                            ),
                        seed: new Map<string, LimitedVersionedObject>(),
                    }),
                ),
            );
        return this.limitedObjects.get(type);
    }

    private loadLimitedObjects(
        type: keyof Reference,
        continuationToken = undefined,
    ): Observable<LimitedVersionedObject[]> {
        return this.repositoryService
            .SearchObjects({
                type: DomainObjectType[type],
                query: '*',
                limit: 1_000_000,
                continuation_token: continuationToken,
            })
            .pipe(
                retry(1),
                switchMap((resp) => {
                    if (resp.continuation_token) {
                        return this.loadLimitedObjects(type, resp.continuation_token).pipe(
                            map((nextObject) => [...resp.result, ...nextObject]),
                        );
                    }
                    return of(resp.result);
                }),
            );
    }
}
