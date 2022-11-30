import { Reference, DomainObject } from '@vality/domain-proto/lib/domain';

export interface DataSourceItem {
    type: string;
    ref: Reference;
    obj: DomainObject;
    stringified: string;
}
