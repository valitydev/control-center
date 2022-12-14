import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PartiesSearchFiltersModule } from './parties-search-filters';
import { PartiesTableModule } from './parties-table';
import { SearchPartiesRoutingModule } from './search-parties-routing.module';
import { SearchPartiesComponent } from './search-parties.component';

@NgModule({
    imports: [
        SearchPartiesRoutingModule,
        FlexModule,
        MatCardModule,
        PartiesSearchFiltersModule,
        PartiesTableModule,
        CommonModule,
        EmptySearchResultModule,
        MatProgressBarModule,
    ],
    declarations: [SearchPartiesComponent],
})
export class SearchPartiesModule {}
