import { Claim } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import uniqBy from 'lodash-es/uniqBy';
import { of } from 'rxjs';
import uuid from 'uuid';

import {
    isTypeWithAliases,
    MetadataFormExtension,
    MetadataFormExtensionOption,
} from '@cc/app/shared/components/metadata-form';

function createPartyOptions(
    values: IterableIterator<{ id: string }>
): MetadataFormExtensionOption[] {
    return Array.from(values).map((value) => ({
        label: 'from party',
        details: value,
        value: value.id,
    }));
}

function createClaimOptions(
    modificationUnits: { id: string; modification: unknown }[]
): MetadataFormExtensionOption[] {
    return uniqBy(
        modificationUnits.filter(Boolean).map((unit) => ({
            label: 'from claim',
            details: unit.modification as object,
            value: unit.id,
            color: 'primary',
        })),
        'value'
    );
}

function generate() {
    return of(uuid());
}

export function createPartyClaimMetadataFormExtensions(
    party: Party,
    claim: Claim
): MetadataFormExtension[] {
    return [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractorID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contractor_modification
                            )
                        ),
                        ...createPartyOptions(party.contractors.values()),
                    ],
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contract_modification
                            )
                        ),
                        ...createPartyOptions(party.contracts.values()),
                    ],
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.shop_modification
                            )
                        ),
                        ...createPartyOptions(party.shops.values()),
                    ],
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.wallet_modification
                            )
                        ),
                        ...createPartyOptions(party.wallets.values()),
                    ],
                    generate,
                    isIdentifier: true,
                }),
        },
    ];
}
