import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';

import {
    ObservableResource,
    ObservableResourceActionType,
    ObservableResourceActions,
} from './observable-resource';

const MORE_ACTION = 'more' satisfies ObservableResourceActionType;
const UPDATE_PAGED_OPTIONS_ACTION = 'update-options' satisfies ObservableResourceActionType;
type PagedObservableResourceActions =
    | ObservableResourceActions
    | typeof MORE_ACTION
    | typeof UPDATE_PAGED_OPTIONS_ACTION;

export interface PagedObservableResourceInternalOptions {
    size: number;
}

export interface PagedObservableResourceAccResult<TItem> {
    result: TItem[];
    continuationToken?: string;
}

export type PagedObservableResourceLoaderOptions = PagedObservableResourceInternalOptions & {
    continuationToken?: string;
};

interface PagedObservableResourceOptions<TItem, TParams = void>
    extends Partial<PagedObservableResourceInternalOptions> {
    loader: (
        params: TParams,
        options: PagedObservableResourceLoaderOptions,
    ) => Observable<PagedObservableResourceAccResult<TItem>>;
}
export class PagedObservableResource<TItem, TParams = void> extends ObservableResource<
    PagedObservableResourceAccResult<TItem>,
    TParams,
    TItem[],
    PagedObservableResourceActions
> {
    hasMore$ = this.accValue$.pipe(map((value) => !!value.continuationToken));
    hasMore = toSignal(this.hasMore$, { initialValue: false });

    // TODO: deprecated
    result$ = this.value$;

    protected pagedOptions: PagedObservableResourceInternalOptions = { size: 20 };

    constructor(options: PagedObservableResourceOptions<TItem, TParams>) {
        super({
            loader: (params, acc, action) => {
                return options
                    .loader(
                        params,
                        action === 'more'
                            ? { ...this.pagedOptions, continuationToken: acc.continuationToken }
                            : this.pagedOptions,
                    )
                    .pipe(
                        map((result) => ({
                            result: [...acc.result, ...result.result],
                            continuationToken: result.continuationToken,
                        })),
                    );
            },
        });
    }

    more() {
        this.action(MORE_ACTION);
    }

    setOptions(options: PagedObservableResourceInternalOptions) {
        this.pagedOptions = options;
        this.action(UPDATE_PAGED_OPTIONS_ACTION);
    }

    // TODO: deprecated
    load(params: TParams, options?: PagedObservableResourceInternalOptions) {
        this.pagedOptions = options;
        this.setParams(params);
    }
}

export function pagedObservableResource<TItem, TParams = void>(
    options: PagedObservableResourceOptions<TItem, TParams>,
) {
    return new PagedObservableResource<TItem, TParams>(options);
}

export abstract class PagedObservableResourceSuperclass<
    TItem,
    TParams = void,
> extends PagedObservableResource<TItem, TParams> {
    abstract loader(
        ...args: Parameters<PagedObservableResourceOptions<TItem, TParams>['loader']>
    ): ReturnType<PagedObservableResourceOptions<TItem, TParams>['loader']>;

    constructor() {
        super({ loader: (params, options) => this.loader(params, options) });
    }
}
