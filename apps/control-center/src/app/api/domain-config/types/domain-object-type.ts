import { metadata$ } from '@vality/domain-proto';
import { DomainObjectType } from '@vality/domain-proto/domain';
import { createThriftEnum } from '@vality/ng-thrift';
import { map, share } from 'rxjs';

export const DOMAIN_OBJECT_TYPE$ = metadata$.pipe(
    map((metadata) => createThriftEnum<DomainObjectType>(metadata, 'domain', 'DomainObjectType')),
    share(),
);
