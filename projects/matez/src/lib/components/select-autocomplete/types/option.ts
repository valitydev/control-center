import { PossiblyAsync } from '@vality/matez';

export interface Option<T> {
    value: T;
    label: string;
    description?: string;
    type?: unknown;
    details?: PossiblyAsync<unknown>;
}
