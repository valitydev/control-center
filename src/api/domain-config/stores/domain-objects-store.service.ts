import { map } from 'rxjs';

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';

import { DomainObjectType, Reference } from '@vality/domain-proto/domain';
import { LimitedVersionedObject, VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { ObservableResource, fetchAll, observableResource } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';

import { ThriftRepositoryService } from '~/api/services';

import { createObjectHash } from '../utils/create-object-hash';

@Injectable({ providedIn: 'root' })
export class DomainObjectsStoreService {
    private repositoryService = inject(ThriftRepositoryService);
    private injector = inject(Injector);

    private limitedObjects = new Map<
        keyof Reference,
        ObservableResource<Map<string, LimitedVersionedObject>>
    >();

    private objects = new Map<keyof Reference, ObservableResource<Map<string, VersionedObject>>>();

    getLimitedObjects(type: keyof Reference) {
        return this.getLimitedObjectsByType(type).map((objects) => Array.from(objects.values()));
    }

    getLimitedObject(ref: Reference) {
        const type = getUnionKey(ref);
        return this.getLimitedObjectsByType(type).map((objects) =>
            objects.get(createObjectHash(ref)),
        );
    }

    getObjects(type: keyof Reference) {
        return this.getObjectsByType(type).map((objects) => Array.from(objects.values()));
    }

    getObject(ref: Reference) {
        const type = getUnionKey(ref);
        return this.getObjectsByType(type).map((objects) => objects.get(createObjectHash(ref)));
    }

    private getLimitedObjectsByType(type: keyof Reference) {
        if (!this.limitedObjects.has(type))
            this.limitedObjects.set(
                type,
                runInInjectionContext(this.injector, () =>
                    observableResource({
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

    private getObjectsByType(type: keyof Reference) {
        if (!this.objects.has(type))
            this.objects.set(
                type,
                runInInjectionContext(this.injector, () =>
                    observableResource({
                        loader: (_, objects) =>
                            fetchAll((continuationToken) =>
                                this.repositoryService.SearchFullObjects({
                                    type: DomainObjectType[type],
                                    query: '*',
                                    limit: 1_000_000,
                                    continuation_token: continuationToken,
                                }),
                            ).pipe(
                                map((result) => {
                                    objects.clear();
                                    result.forEach((obj) => {
                                        objects.set(
                                            createObjectHash({
                                                [getUnionKey(obj.object)]: getUnionValue(obj.object)
                                                    .ref,
                                            }),
                                            obj,
                                        );
                                    });
                                    return objects;
                                }),
                            ),
                        seed: new Map<string, VersionedObject>(),
                    }),
                ),
            );
        return this.objects.get(type);
    }
}
