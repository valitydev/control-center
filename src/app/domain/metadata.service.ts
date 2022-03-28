import { Injectable } from '@angular/core';
import { Reference } from '@vality/domain-proto/lib/domain';
import { Field, JsonAST } from '@vality/thrift-ts';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface Metadata {
    path: string;
    name: string;
    ast: JsonAST;
}

@Injectable()
export class MetadataService {
    private metadata$: Observable<Metadata[]> = from(
        import('@vality/domain-proto/lib/metadata.json').then((m) => m.default)
    ).pipe(shareReplay(1));

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
        return this.getDomainDef().pipe(
            map((d) => {
                const found = d.find(({ name }) => name === searchName);
                return found ? (found.type as string) : null;
            })
        );
    }

    getDomainDef(): Observable<Field[]> {
        return this.metadata$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union.DomainObject)
        );
    }
}
