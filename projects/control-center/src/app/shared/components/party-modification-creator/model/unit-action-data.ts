import { Modification } from '@vality/domain-proto/lib/claim_management';

export enum UnitActionType {
    AllActions = 'allActions',
    ContractActions = 'contractActions',
    ShopActions = 'shopActions',
    ContractorActions = 'contractorActions',
}

export interface UnitActionData {
    type: UnitActionType;
    partyID: string;
    unitID?: string;
    fromClaim: Modification[];
}
