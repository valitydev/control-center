import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import isEqual from 'lodash-es/isEqual';
import negate from 'lodash-es/negate';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';

import { isEmptyValue } from '@cc/app/shared/utils';

import { Serializer } from './types/serializer';
import { deserializeQueryParam } from './utils/deserialize-query-param';
import { QUERY_PARAMS_SERIALIZERS } from './utils/query-params-serializers';
import { serializeQueryParam } from './utils/serialize-query-param';

type Options = {
    filter?: (param: unknown, key: string) => boolean;
};

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class QueryParamsService<P> {
    params$: Observable<P> = this.route.queryParams.pipe(
        startWith(this.route.snapshot.queryParams),
        distinctUntilChanged<P>(isEqual),
        map((params) => this.deserialize(params)),
        shareReplay({ refCount: true, bufferSize: 1 })
    );

    get params(): P {
        return this.deserialize(this.route.snapshot.queryParams);
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        @Optional() @Inject(QUERY_PARAMS_SERIALIZERS) private readonly serializers?: Serializer[]
    ) {
        // Angular @Optional not support TS syntax: `serializers: Serializer[] = []`
        if (!this.serializers) {
            this.serializers = [];
        }
    }

    async set(params: P, options?: Options): Promise<boolean> {
        return await this.router.navigate([], { queryParams: this.serialize(params, options) });
    }

    async patch(param: Partial<P>): Promise<boolean> {
        return await this.set({ ...this.params, ...param });
    }

    async init(param: P): Promise<boolean> {
        return await this.set({ ...param, ...this.params });
    }

    private serialize(
        params: P,
        { filter = negate(isEmptyValue) }: Options = {}
    ): { [key: string]: string } {
        return Object.entries(params).reduce((acc, [k, v]) => {
            if (filter(v, k)) acc[k] = serializeQueryParam(v, this.serializers);
            return acc;
        }, {} as { [key: string]: string });
    }

    private deserialize(params: Params): P {
        return Object.entries(params).reduce((acc, [k, v]) => {
            try {
                acc[k] = deserializeQueryParam<P[keyof P]>(v, this.serializers);
            } catch (err) {
                console.error(err);
            }
            return acc;
        }, {} as P);
    }
}
