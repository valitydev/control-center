import { PartyID, ShopID } from '@vality/domain-proto';
import { TerminalID } from '@vality/fistful-proto';

export class RemoveTerminalFromShopParams {
    partyID: PartyID;
    shopID: ShopID;
    terminalID: TerminalID;
    providerID: number;
}
