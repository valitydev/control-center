import { Injector } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, filter, fromEvent, map, shareReplay, startWith, tap } from 'rxjs';

export function createStorageValue<T>(
    key: string,
    {
        serialize = (v) => (v === null ? null : String(v)),
        deserialize,
        injector,
    }: {
        serialize?: (v: T) => string | null;
        deserialize: (v: string | null) => T;
        injector?: Injector;
    },
) {
    const value$ = fromEvent<StorageEvent>(document, 'storage').pipe(
        tap(console.log),
        filter((v) => v.key === key),
        map((v) => v.newValue),
        tap(console.log),
        startWith(localStorage.getItem(key)),
        map((v) => deserialize(v)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    value$.subscribe(console.log);

    return {
        get(): T {
            return deserialize(localStorage.getItem(key));
        },
        set(value: T): void {
            const serialized = serialize(value);
            if (serialized === null) {
                return localStorage.removeItem(key);
            }
            console.log('set', serialized);
            return localStorage.setItem(key, serialized);
        },
        value$,
        value: toSignal(value$, { injector }),
    };
}
