import { TerminalID } from '@vality/fistful-proto';

import { PartyID, ShopID } from '../../../../thrift-services/damsel/gen-model/domain';
import { TerminalActionTypes } from './terminal-action-types';

export interface ChangeProviderParams {
    type: TerminalActionTypes;
    terminalID: TerminalID;
    providerID: number;
    partyID: PartyID;
    shopID: ShopID;
}
