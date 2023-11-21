import { Injectable, TemplateRef, Type } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SidenavInfoService {
    title: string = '';
    template?: TemplateRef<unknown>;
    component?: Type<unknown>;
    inputs?: Record<PropertyKey, unknown>;

    get opened() {
        return !!this.template;
    }

    private id: unknown = null;

    constructor(router: Router) {
        router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
            this.close();
        });
    }

    toggle(template: TemplateRef<unknown>, title: string, id: unknown = null) {
        if (this.template === template && id === this.id) {
            this.close();
        } else {
            this.open(template, title, id);
        }
    }

    open(template: TemplateRef<unknown>, title: string, id: unknown = null) {
        this.template = template;
        this.title = title;
        this.id = id;
    }

    openComponent(component: Type<unknown>, inputs: Record<PropertyKey, unknown> = {}) {
        this.component = component;
        this.inputs = inputs;
    }

    close() {
        this.template = null;
        this.title = '';
        this.id = null;
    }
}
