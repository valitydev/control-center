import { Injectable } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { Reference } from '@vality/domain-proto/domain';
import { Field } from '@vality/thrift-ts';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable()
export class MetadataService {
    private metadata$: Observable<ThriftAstMetadata[]> = from(
        import('@vality/domain-proto/metadata.json').then((m) => m.default),
    ).pipe(shareReplay(1)) as Observable<ThriftAstMetadata[]>;

    get metadata() {
        return this.metadata$;
    }

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
            }),
        );
    }

    getDomainFieldByFieldName(fieldName: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.name === fieldName)),
        );
    }

    getDomainFields(): Observable<Field[]> {
        return this.metadata$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union.DomainObject),
        );
    }
}
