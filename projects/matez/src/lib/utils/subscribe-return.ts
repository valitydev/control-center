import { Observable, Observer } from 'rxjs';

export function subscribeReturn<T>(
    observable$: Observable<T>,
    subscription: Partial<Observer<T>> = {},
) {
    const externalSubscription: Partial<Observer<T>> = {};
    observable$.subscribe({
        next: (value) => {
            if (subscription.next) {
                subscription.next(value);
            }
            if (externalSubscription.next) {
                externalSubscription.next(value);
            }
        },
        error: (err) => {
            if (subscription.error) {
                subscription.error(err);
            }
            if (externalSubscription.error) {
                externalSubscription.error(err);
            }
        },
        complete: () => {
            if (subscription.complete) {
                subscription.complete();
            }
            if (externalSubscription.complete) {
                externalSubscription.complete();
            }
        },
    });
    return {
        next: (nextFn: Observer<T>['next']) => {
            externalSubscription.next = nextFn;
        },
        error: (errorFn: Observer<T>['error']) => {
            externalSubscription.error = errorFn;
        },
        complete: (completeFn: Observer<T>['complete']) => {
            externalSubscription.complete = completeFn;
        },
    };
}
