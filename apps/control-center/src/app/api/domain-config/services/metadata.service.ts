import { Injectable } from '@angular/core';
import { metadata$ } from '@vality/domain-proto';
import { Field } from '@vality/thrift-ts';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MetadataService {
    private metadata$ = metadata$;

    getDomainObjectDataFieldByName(fieldName: string): Observable<Field> {
        return this.getDomainFields().pipe(
            map((fields) => fields.find((f) => f.name === fieldName)),
            withLatestFrom(this.metadata$),
            map(([field, metadata]) =>
                metadata
                    .find(({ name }) => name === 'domain')
                    .ast.struct[String(field.type)]?.find((f) => f.name === 'data'),
            ),
        );
    }

    getDomainFields(): Observable<Field[]> {
        return this.metadata$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union['DomainObject']),
        );
    }
}
