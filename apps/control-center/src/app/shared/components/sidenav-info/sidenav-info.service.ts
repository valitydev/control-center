import { Injectable, InputSignal, Type, inject } from '@angular/core';
import {
    PossiblyAsync,
    QueryParamsNamespace,
    QueryParamsService,
    UrlService,
    getPossiblyAsyncObservable,
} from '@vality/matez';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponents } from './tokens';

type InputType<T> = {
    [N in keyof T]?: T[N] extends InputSignal<infer S> ? S : T[N];
};

@Injectable({
    providedIn: 'root',
})
export class SidenavInfoService {
    component$ = new BehaviorSubject<Type<unknown> | null>(null);
    private qps = inject(QueryParamsService);
    private sidenavInfoComponents = inject<SidenavInfoComponents>(SIDENAV_INFO_COMPONENTS, {
        optional: true,
    });
    inputs?: Record<PropertyKey, unknown>;

    opened$ = this.component$.pipe(map(Boolean));

    private qp!: QueryParamsNamespace<{ id?: string; inputs?: Record<PropertyKey, unknown> }>;

    constructor() {
        const urlService = inject(UrlService);

        if (!this.sidenavInfoComponents) {
            this.sidenavInfoComponents = this.sidenavInfoComponents ?? {};
        }
        urlService.url$.pipe(filter(() => !!this.component$.value)).subscribe(() => {
            this.close();
        });
        this.qp = this.qps.createNamespace('sidenav');
        this.qp.params$
            .pipe(
                filter((params) => !!params.id),
                map((params) => this.getComponentById(params.id)),
                filter((component) => !this.isEqual(component, this.qp.params)),
            )
            .subscribe((component) => {
                this.open(component, this.qp.params.inputs);
            });
    }

    // TODO: Switch to string imports only, there may be problems with component imports
    toggle<C extends Type<unknown>>(
        component: PossiblyAsync<C> | string,
        inputs: InputType<InstanceType<C>> = {},
    ) {
        const component$ = getPossiblyAsyncObservable(
            typeof component === 'string' ? this.getComponentById(component) : component,
        );
        component$.pipe(first()).subscribe((comp) => {
            if (this.isEqual(comp, inputs)) {
                this.close();
            } else {
                this.open(comp, inputs);
            }
        });
    }

    open<C extends Type<unknown>>(component: C, inputs: InputType<InstanceType<C>> = {}) {
        this.component$.next(component);
        this.inputs = inputs;
        void this.qp.set({
            id: this.getComponentId(component),
            inputs: inputs ?? {},
        });
    }

    close() {
        this.component$.next(null);
        this.inputs = null;
        void this.qp.set({});
    }

    private getComponentId(component: Type<unknown>) {
        return Object.entries(this.sidenavInfoComponents).find(
            ([, comp]) => comp === component,
        )?.[0];
    }

    private getComponentById(id: string): Type<unknown> | null {
        if (!id) {
            return null;
        }
        return Object.entries(this.sidenavInfoComponents).find(([key]) => id === key)[1];
    }

    private isEqual<C extends Type<unknown>>(
        component: C,
        inputs: InputType<InstanceType<C>> = {},
    ) {
        return component === this.component$.value && isEqual(this.inputs, inputs);
    }
}
