import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Reference } from '@vality/domain-proto/domain';
import {
    LimitedVersionedObject,
    Repository,
    RepositoryClient,
} from '@vality/domain-proto/domain_config_v2';
import { observableResource } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import { Observable, combineLatest, first, map, of, retry, skipWhile, switchMap } from 'rxjs';

import { DOMAIN_OBJECT_TYPE$ } from '../types';
import { createObjectHash } from '../utils/create-object-hash';
import { createObjectsHashMap } from '../utils/create-objects-hash-map';

@Injectable({ providedIn: 'root' })
export class DomainObjectsStoreService {
    private repositoryService = inject(Repository);
    private repositoryClientService = inject(RepositoryClient);
    private types = signal(new Set<keyof Reference>());

    private objects = observableResource({
        params: () => toObservable(this.types),
        loader: (types, objects) => {
            const newTypes = Array.from(types).filter((t) => !objects.has(t));
            if (!newTypes.length) return of(objects);
            return combineLatest(newTypes.map((t) => this.getAllObjectByType(t))).pipe(
                map((newObjects) => {
                    newObjects.forEach((newObjectsByType, idx) => {
                        objects.set(
                            newTypes[idx],
                            createObjectsHashMap(newObjectsByType, (obj) => obj.ref),
                        );
                    });
                    return objects;
                }),
            );
        },
        seed: new Map<keyof Reference, Map<string, LimitedVersionedObject>>(),
    });

    getObject(ref: Reference) {
        const type = getUnionKey(ref);
        this.types.update((types) => types.add(type));
        return this.objects.value$.pipe(
            skipWhile((objs) => !objs.has(type)),
            map((objs) => objs.get(type).get(createObjectHash(ref))),
        );
    }

    getFullObject(ref: Reference) {
        return this.repositoryClientService.CheckoutObject({ head: {} }, ref);
    }

    private getAllObjectByType(
        type: keyof Reference,
        continuationToken = undefined,
    ): Observable<LimitedVersionedObject[]> {
        return DOMAIN_OBJECT_TYPE$.pipe(
            first(),
            switchMap((types) =>
                this.repositoryService.SearchObjects({
                    type: types[type],
                    query: '*',
                    limit: 1_000_000,
                    continuation_token: continuationToken,
                }),
            ),
        ).pipe(
            retry(1),
            switchMap((resp) => {
                if (resp.continuation_token) {
                    return this.getAllObjectByType(type, resp.continuation_token).pipe(
                        map((nextObject) => [...resp.result, ...nextObject]),
                    );
                }
                return of(resp.result);
            }),
        );
    }
}
