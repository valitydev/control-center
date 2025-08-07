import { Component } from '@angular/core';

import { DialogSuperclass } from '../../../dialog';
import { FiltersComponent } from '../../filters.component';

@Component({
    selector: 'v-filters-dialog',
    templateUrl: './filters-dialog.component.html',
    styleUrls: ['./filters-dialog.component.scss'],
    standalone: false,
})
export class FiltersDialogComponent extends DialogSuperclass<
    FiltersDialogComponent,
    { filters: FiltersComponent }
> {
    get isShowMainFilters() {
        return (
            !this.dialogData.filters.otherFiltersDirective?.templateRef ||
            this.dialogData.filters.merge
        );
    }
}
