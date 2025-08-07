import { PossiblyAsync } from '../is-async';

export type PossiblyAsyncFn<T, P extends unknown[] = []> = (...args: P) => PossiblyAsync<T>;

export type PossiblyAsyncValue<T, P extends unknown[] = []> =
    | PossiblyAsync<T>
    | PossiblyAsyncFn<T, P>;
