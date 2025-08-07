import { EMPTY, combineLatest, merge, mergeMap } from 'rxjs';
import { delay, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { ObservableOrFn, getObservable } from './get-observable';

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
