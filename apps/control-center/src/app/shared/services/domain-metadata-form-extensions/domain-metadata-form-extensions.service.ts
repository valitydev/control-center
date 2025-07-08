import { Injectable, inject } from '@angular/core';
import { ThriftAstMetadata, metadata$ } from '@vality/domain-proto';
import { Claim } from '@vality/domain-proto/claim_management';
import { DomainObject, Party } from '@vality/domain-proto/domain';
import { getNoTimeZoneIsoString } from '@vality/matez';
import { ThriftData, ThriftFormExtension, isTypeWithAliases } from '@vality/ng-thrift';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import short from 'short-uuid';

import { DomainObjectsStoreService, DomainService } from '../../../api/domain-config';

import { createDomainObjectExtension } from './utils/create-domain-object-extension';
import { createPartyClaimDomainMetadataFormExtensions } from './utils/create-party-claim-domain-metadata-form-extensions';
import { getDomainObjectOption } from './utils/get-domain-object-option';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataFormExtensionsService {
    private domainStoreService = inject(DomainObjectsStoreService);
    private domainService = inject(DomainService);

    extensions$: Observable<ThriftFormExtension[]> = metadata$.pipe(
        map((metadata): ThriftFormExtension[] => [
            ...this.createDomainObjectsOptions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'ID', 'base')),
                extension: () => of({ generate: () => of(short().generate()), isIdentifier: true }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, 'PartyID', 'domain') ||
                            isTypeWithAliases(data, 'WalletConfigID', 'domain') ||
                            isTypeWithAliases(data, 'ShopConfigID', 'domain'),
                    ),
                extension: () => of({ generate: () => of(short().uuid()), isIdentifier: true }),
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
                    of({
                        generate: () => of(this.domainService.version.value()),
                    }),
            },
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    createPartyClaimExtensions(party: Party, claim: Claim) {
        return createPartyClaimDomainMetadataFormExtensions(party, claim);
    }

    private createDomainObjectsOptions(metadata: ThriftAstMetadata[]): ThriftFormExtension[] {
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
    ): ThriftFormExtension {
        const objectFields = new ThriftData<string, 'struct'>(metadata, 'domain', objectType).ast;
        const refType = objectFields.find((n) => n.name === 'ref').type as string;
        return createDomainObjectExtension(refType, () =>
            this.domainStoreService
                .getObjects(objectKey)
                .pipe(map((objects) => objects.map((obj) => getDomainObjectOption(obj)))),
        );
    }
}
