import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[vOtherFilters]',
})
export class OtherFiltersDirective {
    constructor(public templateRef: TemplateRef<unknown>) {}
}
