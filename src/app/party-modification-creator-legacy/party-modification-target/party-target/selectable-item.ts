import { Contract, Contractor, Shop } from '@vality/domain-proto/lib/domain';

export class SelectableItem {
    id: string;
    data: Contract | Shop | Contractor;
    checked: boolean;
}
