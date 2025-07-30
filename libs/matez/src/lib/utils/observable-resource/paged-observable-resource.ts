import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';

import {
    ObservableResource,
    ObservableResourceAction,
    ObservableResourceOptions,
} from './observable-resource';

const MORE_ACTION = new ObservableResourceAction('more');

class ObservableResourceSetOptionsAction extends ObservableResourceAction {
    constructor(public readonly options: PagedObservableResourceLoaderOptions) {
        super('options');
    }
}

export interface PagedObservableResourceAccResult<TItem> {
    result: TItem[];
    continuationToken?: string;
}

export interface PagedObservableResourceLoaderOptions {
    size: number;
    continuationToken?: string;
}

export interface PagedObservableResourceOptions<TItem, TParams = void>
    extends ObservableResourceOptions<PagedObservableResourceAccResult<TItem>, TParams, TItem[]>,
        Partial<PagedObservableResourceLoaderOptions> {
    partialLoader: (
        params: TParams,
        options: PagedObservableResourceLoaderOptions,
    ) => Observable<PagedObservableResourceAccResult<TItem>>;
}

export class PagedObservableResource<TItem, TParams = void> extends ObservableResource<
    PagedObservableResourceAccResult<TItem>,
    TParams,
    TItem[]
> {
    hasMore$ = this.accValue$.pipe(map((value) => !!value.continuationToken));
    hasMore = toSignal(this.hasMore$, { initialValue: false });

    more() {
        this.action$.next(MORE_ACTION);
    }

    setOptions(options: PagedObservableResourceLoaderOptions) {
        this.action$.next(new ObservableResourceSetOptionsAction(options));
    }
}

export function pagedObservableResource<TItem, TParams = void>(
    options: PagedObservableResourceOptions<TItem, TParams>,
) {
    return new PagedObservableResource<TItem, TParams>(options);
}

export abstract class PagedObservableResourceSuperClass<
    TItem,
    TParams = void,
> extends PagedObservableResource<TItem, TParams> {}
