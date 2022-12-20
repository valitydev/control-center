import { PartyID } from '@vality/domain-proto/domain';

import { PartyActions } from './party-actions';

export interface PartyMenuItemEvent {
    action: PartyActions;
    partyID: PartyID;
}
