import { PartyID, ShopID } from '@vality/domain-proto';
import { TerminalID } from '@vality/fistful-proto';

export class EditTerminalDecisionPropertyParams {
    providerID: number;
    terminalID: TerminalID;
    partyID: PartyID;
    shopID: ShopID;
    property: 'weight' | 'priority';
    value: number;
}
