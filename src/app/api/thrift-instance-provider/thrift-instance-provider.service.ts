import { Injectable } from '@angular/core';
import partial from 'lodash-es/partial';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { createThriftInstance, thriftInstanceToObject } from '../../thrift-services';
import { ThriftMetaLoader } from '../thrift-meta-loader';
import { ProviderMethods, ProviderSettings } from './types';

@Injectable({ providedIn: 'root' })
export abstract class ThriftInstanceProvider {
    methods$: Observable<ProviderMethods>;

    constructor(private thriftMetaLoader: ThriftMetaLoader) {
        const { metadataName, defaultNamespace, context } = this.getProviderSettings();
        this.methods$ = this.thriftMetaLoader.get(metadataName).pipe(
            map((metadata) => ({
                toPlainObject: partial(thriftInstanceToObject, metadata, defaultNamespace),
                toThriftInstance: partial(
                    createThriftInstance,
                    metadata,
                    context,
                    defaultNamespace
                ),
            })),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    protected abstract getProviderSettings(): ProviderSettings;
}
