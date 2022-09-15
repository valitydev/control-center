import { Injectable } from '@angular/core';
import { Reference } from '@vality/domain-proto/lib/domain';
import { Field } from '@vality/thrift-ts';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainSecretService } from '@cc/app/shared/services';

import { ThriftAstMetadata } from '../../api/utils';

@Injectable()
export class MetadataService {
    private metadata$: Observable<ThriftAstMetadata[]> = from(
        import('@vality/domain-proto/lib/metadata.json').then((m) => m.default)
    ).pipe(
        map((m) => this.domainSecretService.reduceMetadata(m as any)),
        shareReplay(1)
    );

    get metadata() {
        return this.metadata$;
    }

    constructor(private domainSecretService: DomainSecretService) {}

    getDomainObjectType(ref: Reference): Observable<string | null> {
        if (!ref) {
            return of(null);
        }
        const keys = Object.keys(ref);
        if (keys.length !== 1) {
            return of(null);
        }
        const searchName = keys[0];
        return this.getDomainFields().pipe(
            map((d) => {
                const found = d.find(({ name }) => name === searchName);
                return found ? (found.type as string) : null;
            })
        );
    }

    getDomainFieldByFieldName(fieldName: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.name === fieldName))
        );
    }

    getDomainFields(): Observable<Field[]> {
        return this.metadata$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union.DomainObject)
        );
    }
}
