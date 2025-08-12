import { defer, first, switchMap } from 'rxjs';

export function createProxyObject<T extends object>(targetInstance: () => Promise<T>): T {
    const target$ = defer(targetInstance);
    return new Proxy({} as T, {
        get(_target, prop, _receiver) {
            return (...args) =>
                target$
                    .pipe(first())
                    .pipe(switchMap((resolvedTarget) => resolvedTarget[prop](...args)));
        },
    });
}
