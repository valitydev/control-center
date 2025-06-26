import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import isEqual from 'lodash-es/isEqual';
import negate from 'lodash-es/negate';
import { Observable, concat, defer, skipWhile, take } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { isEmpty } from '../../utils';

import { Serializer } from './types/serializer';
import { QUERY_PARAMS_SERIALIZERS, serializeQueryParams } from './utils';
import { deserializeQueryParam } from './utils/deserialize-query-param';

interface SerializeOptions {
    filter?: Parameters<typeof serializeQueryParams>[1];
}

interface SetOptions extends SerializeOptions {
    isPatch?: boolean;
}

interface SourceParams {
    main: Params;
    namespaces: Record<string, string>;
}

interface BaseQueryParams<T extends object> {
    params$: Observable<Partial<T>>;
    params: Partial<T>;
    set: (params: T, options?: SerializeOptions) => Promise<boolean>;
    patch: (params: Partial<T>, options?: SerializeOptions) => Promise<boolean>;
}

export interface QueryParamsNamespace<T extends object> extends BaseQueryParams<T> {
    destroy: () => void;
}

const NS_PARAM_PREFIX = '__';

@Injectable({ providedIn: 'root' })
export class QueryParamsService<P extends object = NonNullable<unknown>>
    implements BaseQueryParams<P>
{
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private readonly serializers = inject<Serializer[]>(QUERY_PARAMS_SERIALIZERS, {
        optional: true,
    });
    params$: Observable<P> = defer(() => this.sourceParams$).pipe(
        map(({ main }) => main),
        distinctUntilChanged(isEqual),
        map((params) => this.deserialize(params)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    get params(): P {
        return this.deserialize(this.getSourceParams().main);
    }

    private sourceParams$: Observable<SourceParams> = concat(
        this.router.events.pipe(
            startWith(null),
            skipWhile(() => !this.router.navigated),
            map(() => this.route.snapshot.queryParams),
            take(1),
        ),
        this.route.queryParams,
    ).pipe(
        distinctUntilChanged(isEqual),
        map((p) => this.getSourceParams(p)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor() {
        if (!this.serializers) {
            this.serializers = [];
        }
    }

    async set(params: P, options: SerializeOptions = {}): Promise<boolean> {
        return await this.setParams(params, undefined, options);
    }

    async patch(params: Partial<P>, options: SerializeOptions = {}): Promise<boolean> {
        return await this.setParams(params, undefined, { ...options, isPatch: true });
    }

    createNamespace<TNamespaceParams extends object>(
        ns: string,
    ): QueryParamsNamespace<TNamespaceParams> {
        const getNamespaceSourceParams = (sourceParams = this.getSourceParams()): Partial<string> =>
            sourceParams.namespaces[NS_PARAM_PREFIX + ns];
        const getNamespaceParams = (): Partial<TNamespaceParams> =>
            this.deserializeNamespace(getNamespaceSourceParams());
        return {
            params$: this.sourceParams$.pipe(
                map((sourceParams) => getNamespaceSourceParams(sourceParams)),
                distinctUntilChanged(isEqual),
                map((params) => this.deserializeNamespace(params)),
                shareReplay({ refCount: true, bufferSize: 1 }),
            ),
            get params() {
                return getNamespaceParams();
            },
            set: async (params, options = {}): Promise<boolean> => {
                return await this.setParams(params, ns, options);
            },
            patch: async (params, options = {}): Promise<boolean> => {
                return await this.setParams(params, ns, { ...options, isPatch: true });
            },
            destroy: async () => {
                await this.setParams({}, ns);
            },
        };
    }

    private async setParams<TParams extends object>(
        params: Partial<TParams>,
        ns?: string,
        options: SetOptions = {},
    ): Promise<boolean> {
        const sourceParams = this.getSourceParams();
        let queryParams: Params;
        if (ns) {
            const nsKey = NS_PARAM_PREFIX + ns;
            const serializedNamespace = this.serializeNamespace(
                Object.assign(
                    {},
                    options.isPatch && this.deserializeNamespace(sourceParams.namespaces[nsKey]),
                    params,
                ),
            );
            const otherNamespaces = sourceParams.namespaces;
            delete otherNamespaces[nsKey];
            queryParams = Object.assign(
                {},
                sourceParams.main,
                otherNamespaces,
                !!serializedNamespace && { [nsKey]: serializedNamespace },
            );
        } else {
            const replacedKeys = Object.keys(params);
            queryParams = Object.assign(
                {},
                options.isPatch &&
                    Object.fromEntries(
                        Object.entries(sourceParams.main).filter(
                            ([k]) => !replacedKeys.includes(k),
                        ),
                    ),
                this.serialize(params),
                sourceParams.namespaces,
            );
        }
        return await this.router.navigate([], { queryParams });
    }

    private getSourceParams(source: Params = this.route.snapshot.queryParams): SourceParams {
        return Object.entries(source).reduce(
            (acc, [k, v]) => {
                if (k.startsWith(NS_PARAM_PREFIX)) {
                    acc.namespaces[k] = v;
                } else {
                    acc.main[k] = v;
                }
                return acc;
            },
            { main: {}, namespaces: {} } as SourceParams,
        );
    }

    private serialize(params: object, options: SerializeOptions = {}): Params {
        const filter = options.filter ?? negate(isEmpty);
        return serializeQueryParams(params, filter, this.serializers);
    }

    private deserialize(params: Params): P {
        if (!params) {
            return {} as P;
        }
        return Object.entries(params).reduce((acc, [k, v]) => {
            try {
                acc[k as keyof P] = deserializeQueryParam<P[keyof P]>(v, this.serializers);
            } catch (err) {
                console.error(err);
            }
            return acc;
        }, {} as P);
    }

    private serializeNamespace<TNamespaceParams extends object>(params?: TNamespaceParams): string {
        return params && Object.keys(params).length ? JSON.stringify(params) : '';
    }

    private deserializeNamespace<TNamespaceParams extends object>(
        strParams?: string,
    ): TNamespaceParams {
        return strParams ? JSON.parse(strParams) : ({} as TNamespaceParams);
    }
}
