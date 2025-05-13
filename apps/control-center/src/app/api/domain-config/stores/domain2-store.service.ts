import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Reference } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { switchCombineWith } from '@vality/matez';
import { getUnionKey, getUnionValue } from '@vality/ng-thrift';
import { Observable, map, share, tap } from 'rxjs';

import { RepositoryClientService } from '../repository-client.service';
import { Repository2Service } from '../repository2.service';
import { DomainSecretService } from '../services';
import { createObjectHash } from '../utils/create-object-hash';

@Injectable({
    providedIn: 'root',
})
export class Domain2StoreService {
    version = rxResource({
        loader: () =>
            this.repositoryService.GetLatestVersion().pipe(
                tap((version) => this.setObjectsVersion(version)),
                share(),
            ),
    });

    private objectsVersion: number = null;
    private objects = new Map<string, VersionedObject>();

    constructor(
        private repositoryService: Repository2Service,
        private repositoryClientService: RepositoryClientService,
        private domainSecretService: DomainSecretService,
    ) {}

    getObject(ref: Reference): Observable<VersionedObject> {
        return this.getSecretObject(ref).pipe(
            switchCombineWith((obj) => [this.domainSecretService.reduceObject(obj.object)]),
            map(([{ info }, object]) => ({ info, object })),
        );
    }

    private getSecretObject(ref: Reference, version = this.version.value()) {
        return this.repositoryClientService.CheckoutObject({ version }, ref).pipe(
            tap((obj) => {
                this.setObject(obj, version);
            }),
            share(),
        );
    }

    private setObjectsVersion(newVersion: number) {
        if (this.objectsVersion !== newVersion) {
            this.objectsVersion = newVersion;
            this.objects.clear();
        }
    }

    private setObject(obj: VersionedObject, version: number) {
        if (version === this.objectsVersion) {
            this.objects.set(
                createObjectHash({ [getUnionKey(obj.object)]: getUnionValue(obj.object).ref }),
                obj,
            );
        }
    }
}
