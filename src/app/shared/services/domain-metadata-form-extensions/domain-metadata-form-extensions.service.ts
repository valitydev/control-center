import { Injectable } from '@angular/core';
import { DomainObject, Cash } from '@vality/domain-proto/lib/domain';
import { Field } from '@vality/thrift-ts';
import moment from 'moment';
import { from, Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import * as short from 'short-uuid';

import { ThriftAstMetadata } from '@cc/app/api/utils';

import { Cash as CashField } from '../../../../components/cash-field';
import { toMajor, toMinor } from '../../../../utils';
import { DomainStoreService } from '../../../thrift-services/damsel/domain-store.service';
import {
    MetadataFormData,
    MetadataFormExtension,
    isTypeWithAliases,
} from '../../components/metadata-form';
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
        map((metadata): MetadataFormExtension[] => [
            ...this.createDomainObjectsOptions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'ID', 'base')),
                extension: () => of({ generate: () => of(short().generate()), isIdentifier: true }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: () => of({ type: 'datetime', generate: () => of(moment()) }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Cash', 'domain')),
                extension: () =>
                    of({
                        type: 'cash',
                        converter: {
                            internalToOutput: (cash: CashField): Cash =>
                                cash
                                    ? {
                                          amount: toMinor(cash.amount, cash.currencyCode),
                                          currency: { symbolic_code: cash.currencyCode },
                                      }
                                    : null,
                            outputToInternal: (cash: Cash) =>
                                cash
                                    ? {
                                          amount: toMajor(cash.amount, cash.currency.symbolic_code),
                                          currency: cash.currency.symbolic_code,
                                      }
                                    : null,
                        },
                    }),
            },
        ]),
        shareReplay(1)
    );

    constructor(private domainStoreService: DomainStoreService) {}

    private createDomainObjectsOptions(metadata: ThriftAstMetadata[]): MetadataFormExtension[] {
        const domainFields = new MetadataFormData<string, Field[]>(
            metadata,
            'domain',
            'DomainObject'
        ).ast;
        return domainFields
            .filter(
                (f) => !(f.name in DOMAIN_OBJECTS_TO_OPTIONS) || DOMAIN_OBJECTS_TO_OPTIONS[f.name]
            )
            .map((f) =>
                this.createFieldOptions(metadata, f.type as string, f.name as keyof DomainObject)
            );
    }

    private createFieldOptions(
        metadata: ThriftAstMetadata[],
        objectType: string,
        objectKey: keyof DomainObject
    ): MetadataFormExtension {
        const objectFields = new MetadataFormData<string, Field[]>(metadata, 'domain', objectType)
            .ast;
        const refType = objectFields.find((n) => n.name === 'ref').type as string;
        return createDomainObjectExtension(refType, () =>
            this.domainStoreService.getObjects(objectKey).pipe(
                map((objects) => {
                    const domainObjectToOption =
                        objectKey in DOMAIN_OBJECTS_TO_OPTIONS
                            ? DOMAIN_OBJECTS_TO_OPTIONS[objectKey as keyof OtherDomainObjects]
                            : defaultDomainObjectToOption;
                    return objects.map(domainObjectToOption);
                })
            )
        );
    }
}
