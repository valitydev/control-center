import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ThriftAstMetadata } from '../../thrift-services';
import { ApiMetadata } from './types/api-metadata';

@Injectable({ providedIn: 'root' })
export class ThriftMetaLoader {
    private metadata$: BehaviorSubject<ApiMetadata> = new BehaviorSubject({});

    constructor(private http: HttpClient) {}

    get(name: string): Observable<ThriftAstMetadata[]> {
        return this.metadata$.pipe(
            switchMap((meta) => {
                const foundedName = Object.keys(meta).find((metaName) => metaName === name);
                if (foundedName) {
                    return of(meta[foundedName]);
                }
                return this.load(name);
            })
        );
    }

    private load(name: string): Observable<ThriftAstMetadata[]> {
        return this.http.get<ThriftAstMetadata[]>(`assets/api-meta/${name}.json`).pipe(
            tap((meta) =>
                this.metadata$.next({
                    ...this.metadata$.value,
                    [name]: meta,
                })
            )
        );
    }
}
