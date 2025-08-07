import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
    selector: '[vMainFilters]',
    standalone: false,
})
export class MainFiltersDirective {
    public templateRef = inject<TemplateRef<unknown>>(TemplateRef<unknown>);
}
