import { Component, Input } from '@angular/core';

import { FiltersComponent } from '../../filters.component';

@Component({
    selector: 'v-more-filters-button',
    templateUrl: './more-filters-button.component.html',
    styleUrls: ['./more-filters-button.component.scss'],
})
export class MoreFiltersButtonComponent {
    @Input() filters!: FiltersComponent;
}
