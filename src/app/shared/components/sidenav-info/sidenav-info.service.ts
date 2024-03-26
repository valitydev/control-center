import { Injectable, Type, Inject, Optional } from '@angular/core';
import {
    QueryParamsService,
    QueryParamsNamespace,
    getPossiblyAsyncObservable,
    PossiblyAsync,
    UrlService,
} from '@vality/ng-core';
import isEqual from 'lodash-es/isEqual';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponents } from './tokens';

@Injectable({
    providedIn: 'root',
})
export class SidenavInfoService {
    component$ = new BehaviorSubject<Type<unknown> | null>(null);
    inputs?: Record<PropertyKey, unknown>;

    opened$ = this.component$.pipe(map(Boolean));

    private qp!: QueryParamsNamespace<{ id?: string; inputs?: Record<PropertyKey, unknown> }>;

    constructor(
        urlService: UrlService,
        private qps: QueryParamsService,
        @Optional()
        @Inject(SIDENAV_INFO_COMPONENTS)
        private sidenavInfoComponents?: SidenavInfoComponents,
    ) {
        if (!this.sidenavInfoComponents) {
            this.sidenavInfoComponents = sidenavInfoComponents ?? {};
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

    toggle<C extends Type<unknown>>(
        component: PossiblyAsync<C>,
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] | any } = {},
    ) {
        getPossiblyAsyncObservable(component).subscribe((comp) => {
            if (this.isEqual(comp, inputs)) {
                this.close();
            } else {
                this.open(comp, inputs);
            }
        });
    }

    open<C extends Type<unknown>>(
        component: C,
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] } = {},
    ) {
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
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] } = {},
    ) {
        return component === this.component$.value && isEqual(this.inputs, inputs);
    }
}
