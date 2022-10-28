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
                extension: () =>
                    of({ type: 'datetime', generate: () => of(moment().toISOString()) }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Cash', 'domain')),
                extension: () =>
                    this.domainStoreService.getObjects('currency').pipe(
                        map((currencies) => ({
                            type: 'cash',
                            converter: {
                                internalToOutput: (cash: CashField): Cash =>
                                    cash
                                        ? {
                                              amount: toMinor(
                                                  cash.amount,
                                                  currencies.find(
                                                      (c) =>
                                                          c.data.symbolic_code === cash.currencyCode
                                                  )?.data?.exponent
                                              ),
                                              currency: { symbolic_code: cash.currencyCode },
                                          }
                                        : null,
                                outputToInternal: (cash: Cash) =>
                                    cash
                                        ? {
                                              amount: toMajor(
                                                  cash.amount,
                                                  currencies.find(
                                                      (c) =>
                                                          c.data.symbolic_code ===
                                                          cash.currency.symbolic_code
                                                  )?.data?.exponent
                                              ),
                                              currency: cash.currency.symbolic_code,
                                          }
                                        : null,
                            },
                        }))
                    ),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'FailureCode', 'domain')),
                extension: () =>
                    of({
                        options: [
                            'authorization_failed:unknown',
                            'authorization_failed:insufficient_funds',
                            'authorization_failed:payment_tool_rejected:bank_card_rejected:card_expired',
                            'authorization_failed:rejected_by_issuer',
                            'authorization_failed:operation_blocked',
                            'authorization_failed:account_stolen',
                            'authorization_failed:temporarily_unavailable',
                            'authorization_failed:account_limit_exceeded:number',
                            'authorization_failed:account_limit_exceeded:amount',
                            'authorization_failed:security_policy_violated',
                            'preauthorization_failed',
                            'authorization_failed:payment_tool_rejected:bank_card_rejected:cvv_invalid',
                            'authorization_failed:account_not_found',
                            'authorization_failed:payment_tool_rejected:bank_card_rejected:card_number_invalid',
                            'authorization_failed:rejected_by_issuer',
                        ]
                            .sort()
                            .map((value) => ({ value })),
                        generate: () => of('authorization_failed:unknown'),
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
