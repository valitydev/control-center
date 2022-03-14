import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, ObservableInput } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata } from '../../thrift-services';

@Injectable({ providedIn: 'root' })
export class ThriftMetaLoader {
    private requests: { [name: string]: Observable<ThriftAstMetadata[]> } = {};

    constructor(private http: HttpClient) {}

    get(name: string, load?: () => ObservableInput<any>): Observable<ThriftAstMetadata[]> {
        const req = this.requests[name];
        return req
            ? req
            : (this.requests[name] = (load
                  ? from(load())
                  : this.http.get<ThriftAstMetadata[]>(`assets/api-meta/${name}.json`)
              ).pipe(shareReplay(1)));
    }
}
