import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DomainObject } from '@vality/domain-proto/domain';
import isEqual from 'lodash-es/isEqual';
import { of, Observable, from } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { MetadataViewExtension } from '@cc/app/shared/components/json-viewer';
import { isTypeWithAliases, MetadataFormData } from '@cc/app/shared/components/metadata-form';

import { getObjectLabel } from './utils/get-object-label';

@UntilDestroy()
@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = from(
        import('@vality/domain-proto/metadata.json').then(
            (m) => m.default as never as ThriftAstMetadata[]
        )
    ).pipe(
        map((metadata) => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: (_, value) =>
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
                            value: getObjectLabel(obj, objectKey),
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
