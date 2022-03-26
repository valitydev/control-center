import { PartyID, ShopID } from '@vality/domain-proto';
import { TerminalID } from '@vality/fistful-proto';

import { TerminalActionTypes } from './terminal-action-types';

export interface ChangeProviderParams {
    type: TerminalActionTypes;
    terminalID: TerminalID;
    providerID: number;
    partyID: PartyID;
    shopID: ShopID;
}
