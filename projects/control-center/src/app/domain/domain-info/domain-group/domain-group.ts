import { Reference } from '@vality/domain-proto/lib/domain_config';

export interface AbstractDomainObject {
    ref: any;
    data: any;
}

export interface DomainPair {
    ref: Reference;
    object: AbstractDomainObject;
}

export interface DomainGroup {
    name: string | 'undef';
    pairs?: DomainPair[];
}
