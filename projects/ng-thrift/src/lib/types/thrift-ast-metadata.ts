import { JsonAST } from '@vality/thrift-ts';
import type { ThriftAst } from '@vality/tsthrift';

/**
 * @deprecated Use `Metadata` type instead
 */
export interface ThriftAstMetadata {
    path: string;
    name: string;
    ast: JsonAST | ThriftAst;
}
