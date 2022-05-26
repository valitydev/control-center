import { Injectable } from '@angular/core';
import { DomainObject } from '@vality/domain-proto';
import { Field } from '@vality/thrift-ts';
import { from, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { PickByValue } from 'utility-types';

import { ThriftAstMetadata } from '@cc/app/api/utils';

import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import {
    MetadataFormData,
    MetadataFormExtension,
    MetadataFormExtensionOption,
} from '../../components/metadata-form';
import { createDomainObjectMetadataFormExtension } from './utils/create-domain-object-metadata-form.extension';

type DomainRefDataObjects = PickByValue<
    DomainObject,
    {
        ref: { id: number | string };
        data: { name?: string; id?: string };
    }
>;
type OtherDomainObjects = Omit<DomainObject, keyof DomainRefDataObjects>;

const DOMAIN_OBJECTS_TO_OPTIONS: {
    [N in keyof OtherDomainObjects]-?: (o: OtherDomainObjects[N]) => MetadataFormExtensionOption;
} = {
    /* eslint-disable @typescript-eslint/naming-convention */
    currency: (o) => ({ value: o.ref.symbolic_code, label: o.data.name }),
    payment_method: null,
    globals: null,
    identity_provider: (o) => ({ value: o.ref.id }),
    dummy_link: (o) => ({ value: o.ref.id, label: o.data.link.id }),
    /* eslint-enable @typescript-eslint/naming-convention */
};
function defaultDomainObjectToOption(o: DomainRefDataObjects[keyof DomainRefDataObjects]) {
    let label: string;
    if ('name' in o.data) label = o.data.name;
    if ('id' in o.data && !label) label = o.data.id;
    return { value: o.ref.id, label };
}

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataFormExtensionsService {
    metadataFormExtensions$: Observable<MetadataFormExtension[]> = from(
        import('@vality/domain-proto/lib/metadata.json').then(
            (m) => m.default as never as ThriftAstMetadata[]
        )
    ).pipe(
        map((metadata) => {
            const domainFields = new MetadataFormData<string, Field[]>(
                metadata,
                'domain',
                'DomainObject'
            ).ast;
            return domainFields.map((f) => {
                const objectFields = new MetadataFormData<string, Field[]>(
                    metadata,
                    'domain',
                    f.type as string
                ).ast;
                const refType = objectFields.find((n) => n.name === 'ref').type as string;
                return createDomainObjectMetadataFormExtension(refType, () =>
                    this.domainStoreService
                        .getObjects(f.name as keyof DomainObject)
                        .pipe(
                            map((objects) =>
                                objects.map((o) =>
                                    f.name in DOMAIN_OBJECTS_TO_OPTIONS
                                        ? DOMAIN_OBJECTS_TO_OPTIONS[
                                              f.name as keyof OtherDomainObjects
                                          ](o as never)
                                        : defaultDomainObjectToOption(o as never)
                                )
                            )
                        )
                );
            });
        }),
        shareReplay(1)
    );

    constructor(private domainStoreService: DomainStoreService) {}
}
