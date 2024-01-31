import { formatDate } from '@angular/common';
import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DomainObject } from '@vality/domain-proto/domain';
import { Rational, Timestamp } from '@vality/domain-proto/internal/base';
import { getImportValue } from '@vality/ng-core';
import isEqual from 'lodash-es/isEqual';
import round from 'lodash-es/round';
import { of, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { MetadataViewExtension } from '@cc/app/shared/components/json-viewer';
import { isTypeWithAliases, MetadataFormData } from '@cc/app/shared/components/metadata-form';

import { getUnionValue } from '../../../../../../../../utils';
import { SidenavInfoService } from '../../../../../sidenav-info';
import { getDomainObjectDetails } from '../../../utils';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = getImportValue<ThriftAstMetadata[]>(
        import('@vality/domain-proto/metadata.json'),
    ).pipe(
        map((metadata): MetadataViewExtension[] => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: (_, value: Timestamp) =>
                    of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, 'Rational', 'base') &&
                            isTypeWithAliases(data.parent, 'CashVolumeShare', 'domain'),
                    ),
                extension: (_, value: Rational) =>
                    of({
                        value: `${round((value.p / value.q) * 100, 4)}%`,
                        tooltip: `${value.p}/${value.q}`,
                    }),
            },
        ]),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    constructor(
        private domainStoreService: DomainStoreService,
        private sidenavInfoService: SidenavInfoService,
        private destroyRef: DestroyRef,
    ) {}

    createDomainObjectExtensions(metadata: ThriftAstMetadata[]): MetadataViewExtension[] {
        const domainFields = new MetadataFormData<string, 'struct'>(
            metadata,
            'domain',
            'DomainObject',
        ).ast;
        return domainFields.map((f) => {
            const objectKey = f.name as keyof DomainObject;
            const objectFields = new MetadataFormData<string, 'struct'>(
                metadata,
                'domain',
                f.type as string,
            ).ast;
            const refType = objectFields.find((n) => n.name === 'ref').type as string;
            return {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, refType, 'domain') &&
                            !isTypeWithAliases(
                                data?.trueParent?.trueParent,
                                'DomainObject',
                                'domain',
                            ),
                    ),
                extension: (_, value) =>
                    this.domainStoreService.getObjectsRefs(objectKey).pipe(
                        map((refObjs) => refObjs.find(([, o]) => isEqual(o[objectKey].ref, value))),
                        map((refObj) => {
                            if (!refObj) {
                                return undefined;
                            }
                            const [ref, obj] = refObj;
                            return {
                                value: getDomainObjectDetails(obj).label,
                                tooltip: getUnionValue(ref),
                                click: () => {
                                    this.sidenavInfoService.toggle(
                                        import(
                                            '../../../domain-object-card/domain-object-card.component'
                                        ).then((r) => r.DomainObjectCardComponent),
                                        { ref },
                                    );
                                },
                            };
                        }),
                    ),
            };
        });
    }
}
