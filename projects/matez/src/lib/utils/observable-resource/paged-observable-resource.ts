import { EMPTY, Observable, map } from 'rxjs';

import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import {
    ObservableResource,
    ObservableResourceActionType,
    ObservableResourceActions,
    ObservableResourceOptions,
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

export type PagedObservableResourceOptions<TItem, TParams = void> = {
    loader: (
        params: TParams,
        options: PagedObservableResourceLoaderOptions,
    ) => Observable<PagedObservableResourceAccResult<TItem>>;
} & Partial<PagedObservableResourceInternalOptions> &
    Omit<
        ObservableResourceOptions<
            PagedObservableResourceAccResult<TItem>,
            TParams,
            TItem[],
            PagedObservableResourceActions
        >,
        'loader'
    >;
export class PagedObservableResource<TItem, TParams = void> extends ObservableResource<
    PagedObservableResourceAccResult<TItem>,
    TParams,
    TItem[],
    PagedObservableResourceActions
> {
    hasMore$!: Observable<boolean>;
    hasMore!: Signal<boolean>;

    // TODO: deprecated, use value$ / value signal
    result$: Observable<TItem[]>;

    protected pagedOptions!: PagedObservableResourceInternalOptions;

    constructor(options?: PagedObservableResourceOptions<TItem, TParams>) {
        super();
        if (options) this.initPaged(options);
    }

    protected initPaged({
        loader,
        size,
        ...options
    }: PagedObservableResourceOptions<TItem, TParams>) {
        // TODO: fix types
        super.init({
            params: EMPTY,
            ...options,
            loader: (params, acc, action) => {
                return loader(
                    params,
                    action === 'more'
                        ? { ...this.pagedOptions, continuationToken: acc.continuationToken }
                        : this.pagedOptions,
                ).pipe(
                    map((result) => ({
                        ...result,
                        result:
                            action === 'more' ? [...acc.result, ...result.result] : result.result,
                    })),
                );
            },
            map: (value) => value.result,
        } as never);
        this.pagedOptions = { size: size || 20 };
        this.hasMore$ = this.accValue$.pipe(map((value) => !!value.continuationToken));
        this.hasMore = toSignal(this.hasMore$, { initialValue: false });
        this.result$ = this.value$;
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
        this.pagedOptions = options || this.pagedOptions;
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
    options: Omit<PagedObservableResourceOptions<TItem, TParams>, 'loader'> = {} as never;

    abstract loader(
        ...args: Parameters<PagedObservableResourceOptions<TItem, TParams>['loader']>
    ): ReturnType<PagedObservableResourceOptions<TItem, TParams>['loader']>;

    constructor() {
        super();
        // TODO: fix types
        this.initPaged({
            ...this.options,
            loader: (params, options) =>
                (this.loader as never as (...args: unknown[]) => unknown)(params, options),
        } as never);
    }
}
