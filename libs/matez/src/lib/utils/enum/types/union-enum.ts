import { Enum } from './enum';

export type UnionEnum<T extends Enum> = T | `${T}`;
