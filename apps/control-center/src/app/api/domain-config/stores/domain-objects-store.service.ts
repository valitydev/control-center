import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { DomainObjectType, Reference } from '@vality/domain-proto/domain';
import {
    LimitedVersionedObject,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { ObservableResource, fetchAll, observableResource } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { map } from 'rxjs';

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

    getLimitedObject(ref: Reference) {
        const type = getUnionKey(ref);
        return this.getLimitedObjectsByType(type).map((objects) =>
            objects.get(createObjectHash(ref)),
        );
    }

    getLimitedObjects(type: keyof Reference) {
        return this.getLimitedObjectsByType(type).map((objects) => Array.from(objects.values()));
    }

    getObject(ref: Reference) {
        return this.repositoryClientService.CheckoutObject({ head: {} }, ref);
    }

    private getLimitedObjectsByType(type: keyof Reference) {
        if (!this.limitedObjects.has(type))
            this.limitedObjects.set(
                type,
                runInInjectionContext(this.injector, () =>
                    observableResource({
                        initParams: null,
                        loader: (_, objects) =>
                            fetchAll((continuationToken) =>
                                this.repositoryService.SearchObjects({
                                    type: DomainObjectType[type],
                                    query: '*',
                                    limit: 1_000_000,
                                    continuation_token: continuationToken,
                                }),
                            ).pipe(
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
}
