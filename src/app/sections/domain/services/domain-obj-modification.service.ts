import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomainObject, Reference } from '@vality/domain-proto/domain';
import { NotifyLogService } from '@vality/ng-core';
import { Observable, switchMap, BehaviorSubject, defer } from 'rxjs';
import { map, shareReplay, first } from 'rxjs/operators';

import { toJson, getUnionValue, progressTo } from '@cc/utils';

import { DomainStoreService } from '../../../api/domain-config';

import { MetadataService } from './metadata.service';

@Injectable()
export class DomainObjModificationService {
    progress$ = new BehaviorSubject(0);
    fullObject$ = defer(() => this.ref$).pipe(switchMap((ref) => this.getDomainObject(ref, true)));
    object$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.getDomainObject(ref, false).pipe(progressTo(this.progress$))),
        map((obj) => getUnionValue(obj)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    type$ = defer(() => this.ref$).pipe(
        switchMap((ref) => this.metadataService.getDomainObjectType(ref)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private ref$ = this.route.queryParams.pipe(
        map(({ ref }) => {
            try {
                return JSON.parse(ref as string) as Reference;
            } catch (err) {
                this.log.error(err, 'Malformed domain object ref');
                return null;
            }
        }),
    );

    constructor(
        private route: ActivatedRoute,
        private domainStoreService: DomainStoreService,
        private metadataService: MetadataService,
        private log: NotifyLogService,
    ) {}

    private getDomainObject(ref: Reference, rawDomain: boolean): Observable<DomainObject> {
        return this.domainStoreService.getDomain(rawDomain).pipe(
            first(),
            map((domain) => {
                const searchRef = JSON.stringify(ref);
                return domain.get(
                    Array.from(domain.keys()).find((k) => JSON.stringify(toJson(k)) === searchRef),
                );
            }),
        );
    }
}
