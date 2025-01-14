import { JsonAST } from '@vality/thrift-ts';

export type StructureType = keyof JsonAST;

export const STRUCTURE_TYPES: StructureType[] = ['typedef', 'struct', 'union', 'exception', 'enum'];
