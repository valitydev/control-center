import { Observable, isObservable } from 'rxjs';
import { isPromise } from 'rxjs/internal/util/isPromise';

import { Signal, isSignal } from '@angular/core';

export type Async<T> = Observable<T> | Promise<T> | Signal<T>;
export type PossiblyAsync<T> = Async<T> | T;

export function isAsync<T>(value: PossiblyAsync<T>): value is Async<T> {
    return isObservable(value) || isPromise(value) || isSignal(value);
}
