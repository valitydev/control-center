import { DomainObject, Reference } from '@vality/domain-proto/lib/domain';

export interface ModificationItem {
    monacoContent: string;
    meta: any;
    domainObj: DomainObject;
}

export interface DomainModificationModel {
    ref: Reference;
    objectType: string;
    original: ModificationItem;
    modified: Partial<ModificationItem>;
}
