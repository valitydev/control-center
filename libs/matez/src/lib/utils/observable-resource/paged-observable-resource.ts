import {
    ObservableResource,
    ObservableResourceBaseAction,
    ObservableResourceOptions,
} from './observable-resource';

class ObservableResourceMoreAction<TParams> extends ObservableResourceBaseAction<TParams> {}

interface PagedObservableResourceAccResult<TItem> {
    result: TItem[];
    continuationToken?: string;
}

interface PagedObservableResourceOptions<TItem, TParams = void>
    extends ObservableResourceOptions<PagedObservableResourceAccResult<TItem>, TParams, TItem[]> {
    pageSize?: number;
}

export class PagedObservableResource<TItem, TParams = void> extends ObservableResource<
    PagedObservableResourceAccResult<TItem>,
    TParams,
    TItem[]
> {
    constructor(options: PagedObservableResourceOptions<TItem, TParams>) {
        super(options);
    }

    more() {
        this.mergedAction$.next(new ObservableResourceMoreAction(this.params() as TParams));
    }
}

export function pagedObservableResource<TItem, TParams = void>(
    options: PagedObservableResourceOptions<TItem, TParams>,
) {
    return new PagedObservableResource<TItem, TParams>(options);
}
