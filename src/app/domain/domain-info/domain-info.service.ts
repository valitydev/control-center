import { Injectable } from '@angular/core';
import { Snapshot } from '@vality/domain-proto/lib/domain_config';
import { Field } from '@vality/thrift-ts';
import { AsyncSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DomainService } from '../domain.service';
import { MetadataService } from '../metadata.service';

export interface Payload {
    shapshot: Snapshot;
    domainDef: Field[];
}

@Injectable()
export class DomainInfoService {
    payload$: Subject<Payload> = new AsyncSubject();

    constructor(private domainService: DomainService, private metadataService: MetadataService) {}

    initialize(): Observable<void> {
        return combineLatest([
            this.domainService.shapshot,
            this.metadataService.getDomainDef(),
        ]).pipe(
            tap(([shapshot, domainDef]) => {
                this.payload$.next({ shapshot, domainDef });
                this.payload$.complete();
            }),
            map(() => null)
        );
    }
}
