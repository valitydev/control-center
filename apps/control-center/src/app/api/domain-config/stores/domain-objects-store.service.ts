import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { Reference } from '@vality/domain-proto/domain';
import { LimitedVersionedObject } from '@vality/domain-proto/domain_config_v2';
import { getUnionKey } from '@vality/ng-thrift';
import { Observable, combineLatest, first, map, mergeScan, of, retry, switchMap } from 'rxjs';

import { Repository2Service } from '../repository2.service';
import { DOMAIN_OBJECT_TYPE$ } from '../types';
import { createObjectHash } from '../utils/create-object-hash';
import { createObjectsHashMap } from '../utils/create-objects-hash-map';

@Injectable({ providedIn: 'root' })
export class DomainObjectsStoreService {
    private repositoryService = inject(Repository2Service);
    private types = signal(new Set<keyof Reference>());
    private objects = rxResource({
        stream: () =>
            toObservable(this.types).pipe(
                mergeScan((objects, types) => {
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
                }, new Map<keyof Reference, Map<string, LimitedVersionedObject>>()),
            ),
    });

    getObject(ref: Reference) {
        const type = getUnionKey(ref);
        this.types.update((types) => types.add(type));
        return computed(() => this.objects.value().get(type).get(createObjectHash(ref)));
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
            retry(2),
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
