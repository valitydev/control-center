import {
    ContractModificationUnit,
    ShopModificationUnit,
} from '@vality/domain-proto/lib/payment_processing';

export class ModificationUnitContainer {
    saved: boolean;
    typeHash?: string;
    modificationUnit: ContractModificationUnit | ShopModificationUnit;
}
