import { PartyModification } from '@vality/domain-proto/lib/claim_management';

export class PersistentContainer {
    modification: PartyModification;
    saved: boolean;
    typeHash?: string;
}
