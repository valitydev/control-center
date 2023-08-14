import { Observable } from 'rxjs';

import { FetchResult } from './fetch-result';

export type FetchFn<P, R> = (
    params: P,
    continuationToken?: string,
    size?: number,
) => Observable<FetchResult<R>>;
