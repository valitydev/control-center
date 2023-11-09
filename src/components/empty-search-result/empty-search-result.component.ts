import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
    selector: 'cc-empty-search-result',
    templateUrl: 'empty-search-result.component.html',
    styleUrls: ['empty-search-result.component.scss'],
})
export class EmptySearchResultComponent {
    @Input({ transform: booleanAttribute }) unwrapped = false;
    @Input() label: string;
}
