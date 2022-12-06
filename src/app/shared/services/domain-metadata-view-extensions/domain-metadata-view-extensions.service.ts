import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DomainObject } from '@vality/domain-proto';
import { Timestamp } from '@vality/domain-proto/lib/base';
import isEqual from 'lodash-es/isEqual';
import { of, Observable, from } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { PickByValue } from 'utility-types';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { ThriftAstMetadata } from '@cc/app/api/utils';
import { MetadataViewExtension } from '@cc/app/shared/components/json-viewer';
import { isTypeWithAliases, MetadataFormData } from '@cc/app/shared/components/metadata-form';

export type DomainRefDataObjects = PickByValue<DomainObject, { data: { name?: string } }>;
export type OtherDomainObjects = Omit<DomainObject, keyof DomainRefDataObjects>;

const UNNAMED_OBJECTS_LABEL_SELECTORS: {
    [N in keyof OtherDomainObjects]: (obj: DomainObject[N]) => string;
} = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    dummy_link: (o) => o.data?.link?.id,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    identity_provider: (o) => o.ref.id,
    globals: () => '',
};

export function getObjectLabel(o: DomainObject[keyof DomainObject], objectKey: keyof DomainObject) {
    if ('name' in o.data) return o.data.name;
    return UNNAMED_OBJECTS_LABEL_SELECTORS[objectKey](o);
}

@UntilDestroy()
@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = from(
        import('@vality/domain-proto/lib/metadata.json').then(
            (m) => m.default as never as ThriftAstMetadata[]
        )
    ).pipe(
        map((metadata) => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: (_, value: Timestamp) =>
                    of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
            },
        ]),
        untilDestroyed(this),
        shareReplay(1)
    );

    constructor(private domainStoreService: DomainStoreService) {}

    createDomainObjectExtensions(metadata: ThriftAstMetadata[]): MetadataViewExtension[] {
        const domainFields = new MetadataFormData<string, 'struct'>(
            metadata,
            'domain',
            'DomainObject'
        ).ast;
        return domainFields.map((f) => {
            const objectKey = f.name as keyof DomainObject;
            const objectFields = new MetadataFormData<string, 'struct'>(
                metadata,
                'domain',
                f.type as string
            ).ast;
            const refType = objectFields.find((n) => n.name === 'ref').type as string;
            return {
                determinant: (data) => of(isTypeWithAliases(data, refType, 'domain')),
                extension: (_, value) =>
                    this.domainStoreService.getObjects(objectKey).pipe(
                        map((objs) => objs.find((o) => isEqual(o.ref, value))),
                        map((obj) => ({
                            value:
                                getObjectLabel(obj, objectKey) ||
                                objectKey[0].toUpperCase() + objectKey.slice(1),
                            tooltip: obj.ref,
                            link: [
                                ['/domain'],
                                {
                                    queryParams: {
                                        ref: JSON.stringify({ [objectKey]: obj.ref }),
                                    },
                                },
                            ],
                        }))
                    ),
            };
        });
    }
}
