import { Claim, PayoutToolModificationUnit } from '@vality/domain-proto/claim_management';
import { Party } from '@vality/domain-proto/domain';
import { isTypeWithAliases } from '@vality/ng-thrift';
import uniqBy from 'lodash-es/uniqBy';
import { of } from 'rxjs';
import short from 'short-uuid';

import {
    MetadataFormExtension,
    MetadataFormExtensionOption,
} from '../../../components/metadata-form';

function createPartyOptions(
    values: IterableIterator<{ id: string }>,
): MetadataFormExtensionOption[] {
    return Array.from(values).map((value) => ({
        label: 'From party',
        details: value,
        value: value.id,
    }));
}

function createClaimOptions(
    modificationUnits: { id: string; modification: unknown }[],
): MetadataFormExtensionOption[] {
    return uniqBy(
        modificationUnits.filter(Boolean).map((unit) => ({
            label: 'From claim',
            details: unit.modification as object,
            value: unit.id,
            color: 'primary',
        })),
        'value',
    );
}

function createClaimPayoutToolOptions(
    modificationUnits: PayoutToolModificationUnit[],
): MetadataFormExtensionOption[] {
    return uniqBy(
        modificationUnits.map((unit) => ({
            label: 'From claim',
            details: unit.modification,
            value: unit.payout_tool_id,
            color: 'primary',
        })),
        'value',
    );
}

function mergeClaimAndPartyOptions(
    claimOptions: MetadataFormExtensionOption[],
    partyOptions: MetadataFormExtensionOption[],
) {
    return partyOptions.reduce((acc, partyOpt) => {
        const claimPartyOpt = acc.find((o) => o.value === partyOpt.value);
        if (claimPartyOpt) {
            claimPartyOpt.label = 'From claim and party';
            claimPartyOpt.details = { claim: claimPartyOpt.details, party: partyOpt.details };
        } else {
            acc.push(partyOpt);
        }
        return acc;
    }, claimOptions);
}

function generate() {
    return of(short().uuid());
}

export function createPartyClaimDomainMetadataFormExtensions(
    party: Party,
    claim: Claim,
): MetadataFormExtension[] {
    return [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractorID', 'domain')),
            extension: () =>
                of({
                    options: mergeClaimAndPartyOptions(
                        createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contractor_modification,
                            ),
                        ),
                        createPartyOptions(party.contractors.values()),
                    ),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractID', 'domain')),
            extension: () =>
                of({
                    options: mergeClaimAndPartyOptions(
                        createClaimOptions(
                            claim.changeset.map(
                                (unit) =>
                                    unit.modification.party_modification?.contract_modification,
                            ),
                        ),
                        createPartyOptions(party.contracts.values()),
                    ),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
            extension: () =>
                of({
                    options: mergeClaimAndPartyOptions(
                        createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.shop_modification,
                            ),
                        ),
                        createPartyOptions(party.shops.values()),
                    ),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'domain')),
            extension: () =>
                of({
                    options: mergeClaimAndPartyOptions(
                        createClaimOptions(
                            claim.changeset.map(
                                (unit) => unit.modification.party_modification?.wallet_modification,
                            ),
                        ),
                        createPartyOptions(party.wallets.values()),
                    ),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'PayoutToolID', 'domain')),
            extension: () =>
                of({
                    options: createClaimPayoutToolOptions(
                        claim.changeset
                            .map(
                                (unit) =>
                                    unit.modification.party_modification?.contract_modification
                                        ?.modification?.payout_tool_modification,
                            )
                            .filter(Boolean),
                    ),
                    generate: () => of(short().generate()),
                    isIdentifier: true,
                }),
        },
    ];
}
