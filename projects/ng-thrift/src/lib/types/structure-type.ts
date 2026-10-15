import type { ThriftAst } from '@vality/tsthrift';

export type StructureType = keyof ThriftAst;

export const STRUCTURE_TYPES: StructureType[] = ['typedef', 'struct', 'union', 'exception', 'enum'];
