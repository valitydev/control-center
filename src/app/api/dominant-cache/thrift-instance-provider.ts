import { Injectable } from '@angular/core';
import { ValueType } from '@vality/thrift-ts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { thriftInstanceToObject } from '../../thrift-services';
import { ThriftMetaLoader } from '../thrift-meta-loader';

@Injectable({ providedIn: 'root' })
export class ThriftInstanceProvider {
    constructor(private thriftMetaLoader: ThriftMetaLoader) {}

    toPlainObject<V>(indefiniteType: ValueType, thriftInstance: V): Observable<V> {
        return this.thriftMetaLoader
            .get('dominant-cache')
            .pipe(
                map((metadata) =>
                    thriftInstanceToObject(
                        metadata,
                        'dominant_cache',
                        indefiniteType,
                        thriftInstance
                    )
                )
            );
    }

    toThriftInstance() {
        return null;
    }
}
