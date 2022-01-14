import { ThriftInstanceContext } from '../../../thrift-services';

export interface ProviderSettings {
    context: ThriftInstanceContext;
    metadataName: string;
    defaultNamespace: string;
}
