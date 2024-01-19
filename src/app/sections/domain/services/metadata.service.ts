import { Injectable } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { Reference } from '@vality/domain-proto/domain';
import { getImportValue } from '@vality/ng-core';
import { Field } from '@vality/thrift-ts';
import { Observable, of } from 'rxjs';
import { map, shareReplay, withLatestFrom } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MetadataService {
    private metadata$ = getImportValue<ThriftAstMetadata[]>(
        import('@vality/domain-proto/metadata.json'),
    ).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

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

    getDomainFieldByName(fieldName: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.name === fieldName)),
        );
    }

    getDomainFieldByType(fieldType: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.type === fieldType)),
        );
    }

    getDomainObjectDataFieldByName(fieldName: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.name === fieldName)),
            withLatestFrom(this.metadata$),
            map(
                ([field, metadata]) =>
                    metadata
                        .find(({ name }) => name === 'domain')
                        .ast.struct[String(field.type)]?.find((f) => f.name === 'data'),
            ),
        );
    }

    getDomainFields(): Observable<Field[]> {
        return this.metadata$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union.DomainObject),
        );
    }
}
