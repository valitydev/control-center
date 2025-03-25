import { DestroyRef, Injector, Signal, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
    Observable,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    shareReplay,
    startWith,
} from 'rxjs';

interface StorageValueOptions<T> {
    serialize?: (v: T) => string | null;
    deserialize: (v: string | null) => T;
    changed$?: Observable<T>;
}

interface StorageValue<T> {
    get: () => T;
    set: (value: T) => void;
    value$: Observable<T>;
    value: Signal<T | undefined>;
}

const DEFAULT_SERIALIZE = (v: unknown) => (v === null ? null : String(v));

export function createStorageValue<T>(
    key: string,
    { serialize = DEFAULT_SERIALIZE, deserialize, changed$ }: StorageValueOptions<T>,
): StorageValue<T> {
    const injector = inject(Injector);
    const value$ = fromEvent<StorageEvent>(document, 'storage').pipe(
        filter((v) => v.key === key),
        map((v) => v.newValue),
        startWith(localStorage.getItem(key)),
        map((v) => deserialize(v)),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const value: StorageValue<T> = {
        get(): T {
            return deserialize(localStorage.getItem(key));
        },
        set(value: T): void {
            const serialized = serialize(value);
            if (serialized === null) {
                return localStorage.removeItem(key);
            }
            return localStorage.setItem(key, serialized);
        },
        value$,
        value: toSignal(value$, { injector }),
    };

    if (changed$) {
        changed$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((v) => {
            value.set(v);
        });
    }

    return value;
}
