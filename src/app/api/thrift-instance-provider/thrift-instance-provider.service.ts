import { Injectable } from '@angular/core';
import partial from 'lodash-es/partial';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { createThriftInstance, thriftInstanceToObject } from '../../thrift-services';
import { ThriftMetaLoader } from './thrift-meta-loader.service';
import { ProviderMethods, ProviderSettings } from './types';

@Injectable({ providedIn: 'root' })
export abstract class ThriftInstanceProvider {
    methods$: Observable<ProviderMethods>;

    constructor(private thriftMetaLoader: ThriftMetaLoader) {
        const {
            metadataName,
            metadataLoad,
            defaultNamespace,
            context,
        } = this.getProviderSettings();
        this.methods$ = this.thriftMetaLoader
            .get(metadataName || defaultNamespace, metadataLoad)
            .pipe(
                map((metadata) => ({
                    toPlainObject: partial(thriftInstanceToObject, metadata, defaultNamespace),
                    toThriftInstance: partial(
                        createThriftInstance,
                        metadata,
                        context,
                        defaultNamespace
                    ),
                })),
                first()
            );
    }

    protected abstract getProviderSettings(): ProviderSettings;
}
