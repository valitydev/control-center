import { Observable, from, isObservable } from 'rxjs';

import { isSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { Async } from './is-async';

export function fromAsync<T>(asyncValue: Async<T>): Observable<T> {
    return isSignal(asyncValue)
        ? toObservable(asyncValue)
        : isObservable(asyncValue)
          ? asyncValue
          : from(asyncValue);
}
