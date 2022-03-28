import { PartyID, ProviderObject, ShopID } from '@vality/domain-proto/lib/domain';
import { Commit } from '@vality/domain-proto/lib/domain_config';
import { TerminalID } from '@vality/fistful-proto';

import { createAddTerminalToProviderOperation } from './create-add-terminal-to-provider-operation';

export class AddDecisionToProvider {
    partyID: PartyID;
    shopID: ShopID;
    terminalID: TerminalID;
    providerID: number;
}

export const addDecisionToProviderCommit = (
    providerObject: ProviderObject,
    params: AddDecisionToProvider
): Commit => ({
    ops: [
        {
            update: createAddTerminalToProviderOperation(providerObject, params),
        },
    ],
});
