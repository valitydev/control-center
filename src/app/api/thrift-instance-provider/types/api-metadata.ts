import { ThriftAstMetadata } from '@cc/app/api/utils';

export interface ApiMetadata {
    [name: string]: ThriftAstMetadata[];
}
