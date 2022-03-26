import { PartyID } from '@vality/domain-proto';

export enum MainSearchType {
    PartySearchFilter = 'PartySearchFilter',
    GlobalSearchFilter = 'GlobalSearchFilter',
}

export interface MainFilterSearchType {
    type: MainSearchType;
    partyID?: PartyID;
}
