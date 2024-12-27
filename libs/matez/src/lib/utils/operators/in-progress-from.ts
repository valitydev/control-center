import { combineLatest, mergeMap, EMPTY, merge } from 'rxjs';
import { map, delay, shareReplay, distinctUntilChanged, startWith } from 'rxjs/operators';

import { getObservable, ObservableOrFn } from './get-observable';

export function inProgressFrom(
    progress: ObservableOrFn<number | boolean> | ObservableOrFn<number | boolean>[],
    main?: ObservableOrFn,
    init = true,
) {
    const progresses = (Array.isArray(progress) ? progress : [progress]).map((p) =>
        getObservable(p),
    );
    return merge(
        combineLatest(progresses),
        main ? getObservable(main).pipe(mergeMap(() => EMPTY)) : EMPTY,
    ).pipe(
        map((ps) => ps.some((p) => !!p)),
        // make async to bypass angular detect changes
        delay(0),
        startWith(init),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
}
