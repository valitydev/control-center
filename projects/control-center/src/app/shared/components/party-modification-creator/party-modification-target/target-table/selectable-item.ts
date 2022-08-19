import {
    CommentModificationUnit,
    ContractModificationUnit,
    ContractorModificationUnit,
    DocumentModificationUnit,
    FileModificationUnit,
    ShopModificationUnit,
} from '@vality/domain-proto/lib/claim_management';

export class SelectableItem {
    id: string;
    data:
        | ContractorModificationUnit
        | ContractModificationUnit
        | ShopModificationUnit
        | DocumentModificationUnit
        | FileModificationUnit
        | CommentModificationUnit;
    checked?: boolean;
    fromClaim?: boolean;
}
