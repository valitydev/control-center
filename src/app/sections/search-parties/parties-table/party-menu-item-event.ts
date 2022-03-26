import { PartyID } from '@vality/domain-proto';

import { PartyActions } from './party-actions';

export interface PartyMenuItemEvent {
    action: PartyActions;
    partyID: PartyID;
}
