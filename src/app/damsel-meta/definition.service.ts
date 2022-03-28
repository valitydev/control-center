import { Injectable } from '@angular/core';
import { Reference } from '@vality/domain-proto';
import { Field } from '@vality/thrift-ts';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ASTDefinition } from './model';

@Injectable()
export class DefinitionService {
    private def$ = from(
        import('@vality/domain-proto/lib/metadata.json').then((m) => m.default)
    ).pipe(shareReplay(1)) as Observable<ASTDefinition[]>;

    get astDefinition(): Observable<ASTDefinition[]> {
        return this.def$;
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
        return this.def$.pipe(
            map((m) => m.find(({ name }) => name === 'domain').ast.union.DomainObject)
        );
    }
}
