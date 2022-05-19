import { Claim } from '@vality/domain-proto/lib/claim_management';
import { Party } from '@vality/domain-proto/lib/domain';
import uniqBy from 'lodash-es/uniqBy';
import { of } from 'rxjs';
import uuid from 'uuid';

import { isTypeWithAliases, MetadataFormExtension } from '@cc/app/shared';

function createPartyOptions(values: IterableIterator<{ id: string }>) {
    return Array.from(values).map((value) => ({
        label: `${value.id} (from party)`,
        details: value,
        value: value.id,
    }));
}

function createClaimOptions(modificationUnits: { id: string; modification: unknown }[]) {
    return uniqBy(
        modificationUnits.filter(Boolean).map((unit) => ({
            label: `${unit.id} (from claim)`,
            details: unit.modification,
            value: unit.id,
        })),
        'value'
    );
}

function generate() {
    return of(uuid());
}

export function createMetadataFormExtensions(party: Party, claim: Claim): MetadataFormExtension[] {
    return [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractorID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(party.contractors.values()),
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contractor_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(party.contracts.values()),
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contract_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(party.shops.values()),
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.shop_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'domain')),
            extension: () =>
                of({
                    options: [
                        ...createPartyOptions(party.wallets.values()),
                        ...createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.wallet_modification
                            )
                        ),
                    ],
                    generate,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ID', 'base')),
            extension: () => of({ generate }),
        },
    ];
}
