import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ActionsModule } from '../actions';
import { DialogModule } from '../dialog';

import { FiltersDialogComponent } from './components/filters-dialog/filters-dialog.component';
import { MainFiltersDirective } from './components/main-filters/main-filters.directive';
import { MoreFiltersButtonComponent } from './components/more-filters-button/more-filters-button.component';
import { OtherFiltersDirective } from './components/other-filters/other-filters.directive';
import { FiltersComponent } from './filters.component';

@NgModule({
    declarations: [
        FiltersComponent,
        MoreFiltersButtonComponent,
        FiltersDialogComponent,
        OtherFiltersDirective,
        MainFiltersDirective,
    ],
    exports: [
        FiltersComponent,
        MoreFiltersButtonComponent,
        OtherFiltersDirective,
        MainFiltersDirective,
    ],
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        DialogModule,
        LayoutModule,
        ActionsModule,
        MatBadgeModule,
    ],
})
export class FiltersModule {}
