import { Reference, DomainObject } from '@vality/domain-proto/lib/domain';
import { ValuesType } from 'utility-types';

export interface DataSourceItem {
    type: string;
    ref: ValuesType<Reference>;
    sourceRef: Reference;
    sourceObj: DomainObject;
    obj: ValuesType<DomainObject>['data'];
    stringified: string;
}
