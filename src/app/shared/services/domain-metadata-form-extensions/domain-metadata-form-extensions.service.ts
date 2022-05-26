import { Injectable } from '@angular/core';
import { DomainObject } from '@vality/domain-proto';
import { Field } from '@vality/thrift-ts';
import { from, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { ThriftAstMetadata } from '@cc/app/api/utils';

import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import { MetadataFormData, MetadataFormExtension } from '../../components/metadata-form';
import { createDomainObjectExtension } from './utils/create-domain-object-extension';
import {
    defaultDomainObjectToOption,
    DOMAIN_OBJECTS_TO_OPTIONS,
    OtherDomainObjects,
} from './utils/domains-objects-to-options';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataFormExtensionsService {
    extensions$: Observable<MetadataFormExtension[]> = from(
        import('@vality/domain-proto/lib/metadata.json').then(
            (m) => m.default as never as ThriftAstMetadata[]
        )
    ).pipe(
        map((metadata) => this.createDomainObjectsOptions(metadata)),
        shareReplay(1)
    );

    constructor(private domainStoreService: DomainStoreService) {}

    private createDomainObjectsOptions(metadata: ThriftAstMetadata[]) {
        const domainFields = new MetadataFormData<string, Field[]>(
            metadata,
            'domain',
            'DomainObject'
        ).ast;
        return domainFields
            .filter(
                (f) => !(f.name in DOMAIN_OBJECTS_TO_OPTIONS) || DOMAIN_OBJECTS_TO_OPTIONS[f.name]
            )
            .map((f) => this.createFieldOptions(metadata, f.name as keyof DomainObject));
    }

    private createFieldOptions(metadata: ThriftAstMetadata[], fieldKey: keyof DomainObject) {
        const objectFields = new MetadataFormData<string, Field[]>(metadata, 'domain', fieldKey)
            .ast;
        const refType = objectFields.find((n) => n.name === 'ref').type as string;
        return createDomainObjectExtension(refType, () =>
            this.domainStoreService.getObjects(fieldKey).pipe(
                map((objects) => {
                    const domainObjectToOption =
                        fieldKey in DOMAIN_OBJECTS_TO_OPTIONS
                            ? DOMAIN_OBJECTS_TO_OPTIONS[fieldKey as keyof OtherDomainObjects]
                            : defaultDomainObjectToOption;
                    return objects.map(domainObjectToOption);
                })
            )
        );
    }
}
