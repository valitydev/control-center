import { UnionToIntersection } from 'utility-types';

type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;

export type TuplifyUnion<T, L = LastOf<T>> = [T] extends [never]
    ? []
    : [...TuplifyUnion<Exclude<T, L>>, L];
