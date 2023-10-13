import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TableModule } from '@vality/ng-core';

import { EmptySearchResultModule } from '@cc/components/empty-search-result';

import { PageLayoutModule } from '../../shared';

import { PartiesSearchFiltersModule } from './parties-search-filters';
import { SearchPartiesRoutingModule } from './search-parties-routing.module';
import { SearchPartiesComponent } from './search-parties.component';

@NgModule({
    imports: [
        SearchPartiesRoutingModule,
        FlexModule,
        MatCardModule,
        PartiesSearchFiltersModule,
        CommonModule,
        EmptySearchResultModule,
        MatProgressBarModule,
        PageLayoutModule,
        TableModule,
    ],
    declarations: [SearchPartiesComponent],
})
export class SearchPartiesModule {}
