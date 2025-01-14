import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[vOtherFilters]',
    standalone: false,
})
export class OtherFiltersDirective {
    constructor(public templateRef: TemplateRef<unknown>) {}
}
