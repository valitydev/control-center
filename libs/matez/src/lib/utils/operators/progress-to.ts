import { BehaviorSubject, MonoTypeOperatorFunction, defer, isObservable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export function progressTo<T>(
    subject$: BehaviorSubject<number> | (() => BehaviorSubject<number>),
): MonoTypeOperatorFunction<T> {
    const getSub = () => (isObservable(subject$) ? subject$ : subject$());
    return (src$) =>
        defer(() => {
            getSub().next(getSub().getValue() + 1);
            return src$.pipe(finalize(() => getSub().next(getSub().getValue() - 1)));
        });
}
