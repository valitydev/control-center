import { map, delay, share } from 'rxjs/operators';

import { attach } from './attach';
import { getObservable, ObservableOrFn } from './get-observable';

export function inProgressFrom(progress: ObservableOrFn<number>, main?: ObservableOrFn) {
    return (main ? attach(progress, main) : getObservable(progress)).pipe(
        map(Boolean),
        // make async to bypass angular detect changes
        delay(0),
        share()
    );
}
