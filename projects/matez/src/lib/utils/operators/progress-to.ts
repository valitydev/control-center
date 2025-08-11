import { BehaviorSubject, MonoTypeOperatorFunction, defer, isObservable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { WritableSignal, isSignal } from '@angular/core';

export function progressTo<T>(
    subjectSignal:
        | BehaviorSubject<number>
        | WritableSignal<number>
        | (() => BehaviorSubject<number> | WritableSignal<number>),
): MonoTypeOperatorFunction<T> {
    const getSubjectSignal = () =>
        isObservable(subjectSignal) || isSignal(subjectSignal) ? subjectSignal : subjectSignal();
    return (src$) =>
        defer(() => {
            const subSigRes = getSubjectSignal();
            if (isSignal(subSigRes)) {
                subSigRes.update((prev) => prev + 1);
                return src$.pipe(finalize(() => subSigRes.update((prev) => prev - 1)));
            }
            subSigRes.next(subSigRes.getValue() + 1);
            return src$.pipe(finalize(() => subSigRes.next(subSigRes.getValue() - 1)));
        });
}
