import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
    selector: '[vOtherFilters]',
    standalone: false,
})
export class OtherFiltersDirective {
    public templateRef = inject<TemplateRef<unknown>>(TemplateRef<unknown>);
}
