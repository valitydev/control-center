import { Injectable } from '@angular/core';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { Claim } from '@vality/domain-proto/claim_management';
import { DomainObject, Party } from '@vality/domain-proto/domain';
import { getNoTimeZoneIsoString, getImportValue } from '@vality/ng-core';
import { ThriftData, isTypeWithAliases } from '@vality/ng-thrift';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import short from 'short-uuid';

import { DomainStoreService } from '@cc/app/api/domain-config';

import { FistfulStatisticsService, createDsl } from '../../../api/fistful-stat';
import { MetadataFormExtension } from '../../components/metadata-form';

import { createDomainObjectExtension } from './utils/create-domain-object-extension';
import { createPartyClaimDomainMetadataFormExtensions } from './utils/create-party-claim-domain-metadata-form-extensions';
import { getDomainObjectValueOptionFn } from './utils/get-domain-object-option';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataFormExtensionsService {
    extensions$: Observable<MetadataFormExtension[]> = getImportValue<ThriftAstMetadata[]>(
        import('@vality/domain-proto/metadata.json'),
    ).pipe(
        map((metadata): MetadataFormExtension[] => [
            ...this.createDomainObjectsOptions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'ID', 'base')),
                extension: () => of({ generate: () => of(short().generate()), isIdentifier: true }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'claim_management')),
                extension: () =>
                    of({
                        generate: () => this.generateNextWalletId(),
                        isIdentifier: true,
                    }),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: () =>
                    of({
                        type: 'datetime',
                        generate: () => of(getNoTimeZoneIsoString(new Date())),
                    }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, 'FailureCode', 'domain') ||
                            isTypeWithAliases(data, 'FailureCode', 'base'),
                    ),
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
            {
                determinant: (data) => of(isTypeWithAliases(data, 'DataRevision', 'domain')),
                extension: () =>
                    this.domainStoreService.version$.pipe(
                        map(() => ({
                            generate: () => this.domainStoreService.version$,
                        })),
                    ),
            },
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private domainStoreService: DomainStoreService,
        private fistfulStatisticsService: FistfulStatisticsService,
    ) {}

    createPartyClaimExtensions(party: Party, claim: Claim) {
        return createPartyClaimDomainMetadataFormExtensions(party, claim);
    }

    generateNextWalletId() {
        return this.fistfulStatisticsService
            .GetWallets({
                dsl: createDsl({ wallets: {} }),
            })
            .pipe(
                map((res) =>
                    String(
                        Math.max(
                            1,
                            ...res.data.wallets.map((w) => Number(w.id)).filter((id) => !isNaN(id)),
                        ) + 1,
                    ),
                ),
            );
    }

    private createDomainObjectsOptions(metadata: ThriftAstMetadata[]): MetadataFormExtension[] {
        const domainFields = new ThriftData<string, 'struct'>(metadata, 'domain', 'DomainObject')
            .ast;
        return domainFields.map((f) =>
            this.createFieldOptions(metadata, f.type as string, f.name as keyof DomainObject),
        );
    }

    private createFieldOptions(
        metadata: ThriftAstMetadata[],
        objectType: string,
        objectKey: keyof DomainObject,
    ): MetadataFormExtension {
        const objectFields = new ThriftData<string, 'struct'>(metadata, 'domain', objectType).ast;
        const refType = objectFields.find((n) => n.name === 'ref').type as string;
        return createDomainObjectExtension(refType, () =>
            this.domainStoreService.getObjects(objectKey).pipe(
                map((objects) => {
                    const domainObjectToOption = getDomainObjectValueOptionFn(objectKey);
                    return objects.map(domainObjectToOption);
                }),
            ),
        );
    }
}
