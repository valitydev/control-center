import { Party } from '@vality/domain-proto/domain';
import {
    ThriftFormExtension,
    ThriftFormExtensionOption,
    isTypeWithAliases,
} from '@vality/ng-thrift';
import { of } from 'rxjs';
import short from 'short-uuid';

function createPartyOptions(values: IterableIterator<{ id: string }>): ThriftFormExtensionOption[] {
    return Array.from(values).map((value) => ({
        label: 'From party',
        details: value,
        value: value.id,
    }));
}

function generate() {
    return of(short().uuid());
}

export function createPartyDomainMetadataFormExtensions(party: Party): ThriftFormExtension[] {
    return [
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractorID', 'domain')),
            extension: () =>
                of({
                    options: createPartyOptions(party.contractors.values()),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ContractID', 'domain')),
            extension: () =>
                of({
                    options: createPartyOptions(party.contracts.values()),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
            extension: () =>
                of({
                    options: createPartyOptions(party.shops.values()),
                    generate,
                    isIdentifier: true,
                }),
        },
        {
            determinant: (data) => of(isTypeWithAliases(data, 'WalletID', 'domain')),
            extension: () =>
                of({
                    options: createPartyOptions(party.wallets.values()),
                    generate,
                    isIdentifier: true,
                }),
        },
    ];
}
