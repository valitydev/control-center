import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata } from '../../thrift-services';

@Injectable({ providedIn: 'root' })
export class ThriftMetaLoader {
    private requests: { [name: string]: Observable<ThriftAstMetadata[]> } = {};

    constructor(private http: HttpClient) {}

    get(name: string): Observable<ThriftAstMetadata[]> {
        const req = this.requests[name];
        return req
            ? req
            : (this.requests[name] = this.http
                  .get<ThriftAstMetadata[]>(`assets/api-meta/${name}.json`)
                  .pipe(shareReplay(1)));
    }
}
