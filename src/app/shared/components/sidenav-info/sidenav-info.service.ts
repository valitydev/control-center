import { Injectable, TemplateRef, Type, Inject, Optional } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { QueryParamsService, QueryParamsNamespace } from '@vality/ng-core';
import { filter, pairwise, startWith, first, map } from 'rxjs/operators';

import { SIDENAV_INFO_COMPONENTS, SidenavInfoComponents } from './tokens';

@Injectable({
    providedIn: 'root',
})
export class SidenavInfoService {
    /**
     * @deprecated
     */
    title: string = '';
    /**
     * @deprecated
     */
    template?: TemplateRef<unknown>;
    component?: Type<unknown>;
    inputs?: Record<PropertyKey, unknown>;

    get opened() {
        return !!this.template || !!this.component;
    }

    private qp!: QueryParamsNamespace<{ id?: string; inputs?: Record<PropertyKey, unknown> }>;
    private id: unknown = null;

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
                filter((e) => e instanceof NavigationEnd),
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
        this.qp.params$.pipe(first()).subscribe(() => {
            const component = this.getComponentById(this.qp.params.id);
            if (component) {
                this.openComponent(component, this.qp.params.inputs);
            }
        });
    }

    toggle(template: TemplateRef<unknown>, title: string, id: unknown = null) {
        if (this.template === template && id === this.id) {
            this.close();
        } else {
            this.open(template, title, id);
        }
    }

    /**
     * @deprecated
     */
    open(template: TemplateRef<unknown>, title: string, id: unknown = null) {
        this.template = template;
        this.title = title;
        this.id = id;
    }

    openComponent<C extends Type<unknown>>(
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
        this.template = null;
        this.component = null;
        this.title = '';
        this.id = null;
        this.inputs = null;
        void this.qp.set({});
    }

    private getComponentId(component: Type<unknown>) {
        return Object.entries(this.sidenavInfoComponents).find(([, comp]) => comp === component)[0];
    }

    private getComponentById(id: string) {
        if (!id) {
            return null;
        }
        return Object.entries(this.sidenavInfoComponents).find(([key]) => id === key)[1];
    }
}
