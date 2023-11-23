import { Injectable, Type, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService, QueryParamsNamespace } from '@vality/ng-core';
import isEqual from 'lodash-es/isEqual';
import { filter, pairwise, startWith, map } from 'rxjs/operators';

import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponents } from './tokens';

@Injectable({
    providedIn: 'root',
})
export class SidenavInfoService {
    component?: Type<unknown>;
    inputs?: Record<PropertyKey, unknown>;

    get opened() {
        return !!this.component;
    }

    private qp!: QueryParamsNamespace<{ id?: string; inputs?: Record<PropertyKey, unknown> }>;

    constructor(
        router: Router,
        private qps: QueryParamsService,
        @Optional()
        @Inject(SIDENAV_INFO_COMPONENTS)
        private sidenavInfoComponents?: SidenavInfoComponents,
    ) {
        if (!this.sidenavInfoComponents) {
            this.sidenavInfoComponents = sidenavInfoComponents = {};
        }
        router.events
            .pipe(
                startWith(null),
                filter(() => router.navigated),
                map(() => router.url?.split('?', 1)[0].split('#', 1)[0]),
                pairwise(),
                filter(([a, b]) => a !== b && this.opened),
            )
            .subscribe(() => {
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
        component: C,
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] } = {},
    ) {
        if (this.isEqual(component, inputs)) {
            this.close();
        } else {
            this.open(component, inputs);
        }
    }

    open<C extends Type<unknown>>(
        component: C,
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] } = {},
    ) {
        this.component = component;
        this.inputs = inputs;
        void this.qp.set({
            id: this.getComponentId(component),
            inputs: inputs ?? {},
        });
    }

    close() {
        this.component = null;
        this.inputs = null;
        void this.qp.set({});
    }

    private getComponentId(component: Type<unknown>) {
        return Object.entries(this.sidenavInfoComponents).find(
            ([, comp]) => comp === component,
        )?.[0];
    }

    private getComponentById(id: string) {
        if (!id) {
            return null;
        }
        return Object.entries(this.sidenavInfoComponents).find(([key]) => id === key)[1];
    }

    private isEqual<C extends Type<unknown>>(
        component: C,
        inputs: { [N in keyof InstanceType<C>]?: InstanceType<C>[N] } = {},
    ) {
        return component === this.component && isEqual(this.inputs, inputs);
    }
}
