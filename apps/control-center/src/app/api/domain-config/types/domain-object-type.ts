import { DomainObjectType } from '@vality/domain-proto/domain';
import { getImportValue } from '@vality/matez';
import { ThriftAstMetadata, createThriftEnum } from '@vality/ng-thrift';
import { map, share } from 'rxjs';

export const DOMAIN_OBJECT_TYPE$ = getImportValue<ThriftAstMetadata[]>(
    import('@vality/domain-proto/metadata.json'),
).pipe(
    map((metadata) => createThriftEnum<DomainObjectType>(metadata, 'domain', 'DomainObjectType')),
    share(),
);
