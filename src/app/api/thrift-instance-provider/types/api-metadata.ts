import { ThriftAstMetadata } from '../../../thrift-services';

export interface ApiMetadata {
    [name: string]: ThriftAstMetadata[];
}
