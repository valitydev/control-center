import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[vMainFilters]',
    standalone: false,
})
export class MainFiltersDirective {
    constructor(public templateRef: TemplateRef<unknown>) {}
}
