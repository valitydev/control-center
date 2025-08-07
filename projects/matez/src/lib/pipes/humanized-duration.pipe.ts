import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { combineLatest, throttleTime, timer } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { AsyncTransform, AsyncTransformParameters } from '../utils';

export type HumanizedDurationValue = ConstructorParameters<DateConstructor>[0];

export interface HumanizedDurationConfig {
    hasAgoEnding?: boolean;
}

const DEFAULT_TIMER = 7500;

@Pipe({
    standalone: true,
    name: 'humanizedDuration',
    pure: false,
})
export class HumanizedDurationPipe
    extends AsyncTransform<HumanizedDurationValue, [HumanizedDurationConfig]>
    implements PipeTransform
{
    protected result$ = combineLatest([this.params$, timer(0, DEFAULT_TIMER)]).pipe(
        throttleTime(DEFAULT_TIMER),
        map(
            ([[value, config]]) =>
                formatDistanceToNow(new Date(value), { includeSeconds: true }) +
                (config.hasAgoEnding ? ' ago' : ''),
        ),
        distinctUntilChanged(),
    );

    transform(
        ...params: AsyncTransformParameters<HumanizedDurationValue, [HumanizedDurationConfig]>
    ) {
        return super.asyncTransform(params);
    }
}
