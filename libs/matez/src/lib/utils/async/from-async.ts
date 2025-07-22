import { isSignal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, from } from 'rxjs';

import { Async } from './is-async';

export function fromAsync<T>(asyncValue: Async<T>): Observable<T> {
    return isSignal(asyncValue) ? toObservable(asyncValue) : from(asyncValue);
}
