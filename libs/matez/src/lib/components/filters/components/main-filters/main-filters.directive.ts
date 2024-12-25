import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[vMainFilters]',
})
export class MainFiltersDirective {
    constructor(public templateRef: TemplateRef<unknown>) {}
}
